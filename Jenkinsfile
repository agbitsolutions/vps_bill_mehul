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

        stage('Build Docker Image') {
            steps {
                script {
                    def VERSION = "${BUILD_NUMBER}"

                    sh """
                        docker build -t agbitsolutions/billsoftdevops:${VERSION} .
                    """

                    env.VERSION = VERSION
                }
            }
        }

        stage('Push Image') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDS_PSW} | docker login -u ${DOCKERHUB_CREDS_USR} --password-stdin
                    docker push agbitsolutions/billsoftdevops:${VERSION}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl set image deployment/billsoftdevops-deployment \
                    billsoftdevops=agbitsolutions/billsoftdevops:${VERSION} \
                    -n billsoftdevops
                """
            }
        }
    }
}