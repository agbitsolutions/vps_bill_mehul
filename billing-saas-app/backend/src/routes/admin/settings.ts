import express, { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { authenticateToken, requireAdminOrManager } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdminOrManager);

interface SettingRequest {
  key: string;
  category: string;
  value: any;
  defaultValue?: any;
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';
  description?: string;
  isSystemSetting?: boolean;
  isUserEditable?: boolean;
  validation?: Record<string, any>;
  displayName?: string;
  group?: string;
  order?: number;
}

interface SettingResponse {
  id: string;
  key: string;
  category: string;
  value: any;
  defaultValue?: any;
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';
  description?: string;
  isSystemSetting: boolean;
  isUserEditable: boolean;
  validation?: Record<string, any>;
  displayName: string;
  group?: string;
  order: number;
  userValue?: any;
  createdAt: string;
  updatedAt: string;
}

// GET /api/admin/settings - List and search settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      valueType,
      isUserEditable,
      userId,
      page = 1,
      limit = 100
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { key: { contains: search as string, mode: 'insensitive' } },
        { displayName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (valueType) {
      where.valueType = valueType;
    }

    if (isUserEditable !== undefined) {
      where.isUserEditable = isUserEditable === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [settings, total] = await Promise.all([
      prisma.settings.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { key: 'asc' }
        ],
        include: userId ? {
          settingStates: {
            where: { userId: userId as string },
            take: 1
          }
        } : {}
      }),
      prisma.settings.count({ where })
    ]);

    const formattedSettings: SettingResponse[] = settings.map((setting: any) => {
      let parsedValue;
      let parsedDefaultValue;
      let parsedValidation;
      let userValue;

      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        parsedValue = setting.value;
      }

      try {
        parsedDefaultValue = setting.defaultValue ? JSON.parse(setting.defaultValue) : undefined;
      } catch {
        parsedDefaultValue = setting.defaultValue;
      }

      try {
        parsedValidation = setting.validation ? JSON.parse(setting.validation) : undefined;
      } catch {
        parsedValidation = setting.validation;
      }

      // Get user-specific value if requested
      if (userId && setting.settingStates && setting.settingStates.length > 0) {
        try {
          userValue = JSON.parse(setting.settingStates[0].value);
        } catch {
          userValue = setting.settingStates[0].value;
        }
      }

      return {
        id: setting.id,
        key: setting.key,
        category: setting.category,
        value: parsedValue,
        defaultValue: parsedDefaultValue,
        valueType: setting.valueType as any,
        description: setting.description || undefined,
        isSystemSetting: setting.isSystemSetting,
        isUserEditable: setting.isUserEditable,
        validation: parsedValidation,
        displayName: setting.displayName,
        group: setting.group || undefined,
        order: setting.order,
        userValue,
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString()
      };
    });

    // Group by category for better organization
    const groupedSettings = formattedSettings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSettings,
      flatData: formattedSettings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// POST /api/admin/settings - Create new setting
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      key,
      category,
      value,
      defaultValue,
      valueType,
      description,
      isSystemSetting = false,
      isUserEditable = true,
      validation,
      displayName,
      group,
      order = 0
    }: SettingRequest = req.body;

    if (!key || !category || value === undefined || !valueType) {
      return res.status(400).json({
        success: false,
        error: 'Key, category, value, and valueType are required'
      });
    }

    const setting = await prisma.settings.upsert({
      where: {
        category_key: {
          key,
          category
        }
      },
      update: {
        value: JSON.stringify(value),
        description,
        displayName: displayName || key,
        order
      },
      create: {
        key,
        category,
        value: JSON.stringify(value),
        defaultValue: defaultValue ? JSON.stringify(defaultValue) : undefined,
        valueType,
        description,
        isSystemSetting,
        isUserEditable,
        validation: validation ? JSON.stringify(validation) : undefined,
        displayName: displayName || key,
        group,
        order
      }
    });

    res.status(201).json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create setting'
    });
  }
});

// PUT /api/admin/settings - Update multiple settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (typeof updates !== 'object' || updates === null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid update body. Expected an object of settings.'
      });
    }

    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await prisma.settings.findFirst({
        where: { key }
      });

      if (setting) {
        const updated = await prisma.settings.update({
          where: { id: setting.id },
          data: {
            value: JSON.stringify(value)
          }
        });
        results.push(updated);
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} settings successfully`,
      data: results
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

export default router;
