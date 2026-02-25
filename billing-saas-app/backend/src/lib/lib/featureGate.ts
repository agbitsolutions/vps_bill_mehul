import React from 'react';
import { PrismaClient } from '@prisma/client';
import { featureFlagService } from '../services/featureFlagService';
import { verifyToken } from './auth';

// Define enums locally to match Prisma schema
export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC', 
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface FeatureGateRequest {
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
  user?: {
    id: string;
    email: string;
    planType: PlanType;
  };
  [key: string]: any;
}

export interface ApiResponse {
  json: (data: any) => void;
  status: (code: number) => ApiResponse;
}

/**
 * Middleware to check if user has access to a paid feature
 */
export function withFeatureGate(featureName: string) {
  return function(handler: (req: FeatureGateRequest, res: ApiResponse) => Promise<void>) {
    return async function(req: FeatureGateRequest, res: ApiResponse) {
      try {
        // First verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user plan from database or token
        const userPlan = (decoded as any).planType || PlanType.FREE;
        
        // Check feature access
        const access = await featureFlagService.hasFeatureAccess(featureName, userPlan);
        
        if (!access.hasAccess) {
          return res.status(403).json({ 
            error: 'Feature access denied',
            reason: access.reason,
            featureName,
            requiredPlan: await getRequiredPlan(featureName)
          });
        }

        // Add user info to request
        req.user = {
          id: (decoded as any).userId,
          email: (decoded as any).email,
          planType: userPlan
        };

        return handler(req, res);
      } catch (error) {
        console.error('Feature gate error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}

/**
 * Client-side hook to check feature access
 */
export async function checkFeatureAccess(featureName: string): Promise<{
  hasAccess: boolean;
  reason?: string;
  requiredPlan?: PlanType;
}> {
  try {
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ featureName })
    });

    if (!response.ok) {
      return { hasAccess: false, reason: 'Failed to check feature access' };
    }

    return await response.json();
  } catch (error) {
    console.error('Feature access check failed:', error);
    return { hasAccess: false, reason: 'Network error' };
  }
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(featureName: string) {
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [reason, setReason] = React.useState<string>();

  React.useEffect(() => {
    checkFeatureAccess(featureName).then(result => {
      setHasAccess(result.hasAccess);
      setReason(result.reason);
      setLoading(false);
    });
  }, [featureName]);

  return { hasAccess, loading, reason };
}

async function getRequiredPlan(featureName: string): Promise<PlanType | null> {
  const flag = await featureFlagService.getFlag(featureName);
  return flag?.requiredPlan || null;
}

export default withFeatureGate;
