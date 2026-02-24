pipeline {
    agent any

    environment {
        IMAGE_NAME = "agbitsolutions/billsoftdevops"
        NAMESPACE = "billsoftdevops"
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
                    def VERSION = "${env.BUILD_NUMBER}"
                    sh "docker build -t $IMAGE_NAME:$VERSION ."
                }
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push $IMAGE_NAME:$VERSION"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl set image deployment/billsoftdevops-deployment \
                billsoftdevops=$IMAGE_NAME:$VERSION \
                -n $NAMESPACE
                """
            }
        }
    }
}