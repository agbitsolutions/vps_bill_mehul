pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                    docker build -t agbitsolutions/billsoft-frontend:${BUILD_NUMBER} .
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                    docker build -t agbitsolutions/billsoft-backend:${BUILD_NUMBER} ./billing-saas-app/backend
                """
            }
        }

        stage('Push Images') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDS_PSW} | docker login -u ${DOCKERHUB_CREDS_USR} --password-stdin
                    docker push agbitsolutions/billsoft-frontend:${BUILD_NUMBER}
                    docker push agbitsolutions/billsoft-backend:${BUILD_NUMBER}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl set image deployment/billsoft-backend \
                    billsoft-backend=agbitsolutions/billsoft-backend:${BUILD_NUMBER} \
                    -n billsoftdevops

                    kubectl set image deployment/billsoftdevops-deployment \
                    billsoftdevops=agbitsolutions/billsoft-frontend:${BUILD_NUMBER} \
                    -n billsoftdevops
                """
            }
        }
    }
}