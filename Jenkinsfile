pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'tracking-backend'
        FRONTEND_IMAGE_NAME = 'tracking-frontend'
        IMAGE_TAG = 'latest'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                git url: 'https://github.com/rohitvadate236-star/devops_pro_3.git', branch: 'main'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    echo 'Building Backend Docker Image...'
                    // Windows uses bat instead of sh
                    bat "docker build -t ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    echo 'Building Frontend Docker Image...'
                    bat "docker build -t ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying applications to Kubernetes...'
                
                // Load images to Kind/Docker Desktop local nodes (if using local k8s)
                // Note: For production with a remote cluster, you would instead push to DockerHub/ECR 
                // and then run kubectl apply.
                bat '''
                docker image save tracking-frontend:latest | docker exec -i desktop-worker ctr --namespace k8s.io images import -
                docker image save tracking-frontend:latest | docker exec -i desktop-worker2 ctr --namespace k8s.io images import -
                docker image save tracking-backend:latest | docker exec -i desktop-worker ctr --namespace k8s.io images import -
                docker image save tracking-backend:latest | docker exec -i desktop-worker2 ctr --namespace k8s.io images import -
                '''
                
                // Apply Kubernetes YAML files
                bat 'kubectl apply -f k8s/'
                
                // Restart deployments to pick up new local images
                bat 'kubectl rollout restart deployment tracking-backend'
                bat 'kubectl rollout restart deployment tracking-frontend'
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully! The application is deployed.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
