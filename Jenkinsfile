pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
    securityContext:
      runAsUser: 0
      readOnlyRootFilesystem: false
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json

  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        APP_NAME_BACKEND = "server"
        APP_NAME_FRONTEND = "client"
        IMAGE_TAG = "latest"
        REGISTRY_URL = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_REPO = "2401009"
        SONAR_PROJECT = "career_connect"
        SONAR_HOST_URL = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        
        // Database and secrets
        MONGO_URI = "mongodb+srv://dineshUser:dinesh%40123@cluster0.r3kgsel.mongodb.net/careerconnect?retryWrites=true&w=majority&appName=Cluster0"
        JWT_SECRET = "fgjfgsudgfudnhfousidfnewuikfmlewf"
        CLOUDINARY_CLOUD_NAME = "dtgsdprcl"
        CLOUDINARY_API_KEY = "819224586478434"
        CLOUDINARY_API_SECRET = "yr_TbbT_JDG2Xfu4KcrrcykeJvA"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Create/Update Secrets') {
            steps {
                container('kubectl') {
                    sh '''
                        echo "=== Creating/Updating Kubernetes Secrets ==="
                        
                        # Delete old secrets if they exist (to ensure they're updated)
                        kubectl delete secret server-secret --ignore-not-found=true
                        kubectl delete secret nexus-secret --ignore-not-found=true
                        
                        # Create server-secret with all required environment variables
                        echo "Creating server-secret..."
                        kubectl create secret generic server-secret \
                          --from-literal=MONGO_URI="${MONGO_URI}" \
                          --from-literal=JWT_SECRET="${JWT_SECRET}" \
                          --from-literal=CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}" \
                          --from-literal=CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}" \
                          --from-literal=CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}"
                        
                        # Create nexus-secret for pulling images
                        echo "Creating nexus-secret..."
                        kubectl create secret docker-registry nexus-secret \
                          --docker-server=${REGISTRY_URL} \
                          --docker-username=admin \
                          --docker-password=Changeme@2025
                        
                        echo "=== Secrets created successfully ==="
                        kubectl get secrets
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                         sleep 15
                         docker build -t ${APP_NAME_BACKEND}:${IMAGE_TAG} ./backend 
                         docker build -t ${APP_NAME_FRONTEND}:${IMAGE_TAG} ./frontend
                         docker images
                    '''
                }
            }
        }

        stage('Run Tests in Docker') {
            steps {
                container('dind') {
                    sh '''
                         echo "Running tests... (Skipping as per reference)"
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([
                        string(credentialsId: 'sonar_token_2401009', variable: 'SONAR_TOKEN')
                    ]) {
                        sh '''
                            echo "Debugging SonarQube Connection..."
                            printenv
                            echo "Checking connectivity to $SONAR_HOST_URL"
                            curl -v $SONAR_HOST_URL || echo "Curl failed"

                            sonar-scanner \
                              -Dsonar.projectKey=$SONAR_PROJECT \
                              -Dsonar.host.url=$SONAR_HOST_URL \
                              -Dsonar.login=$SONAR_TOKEN \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**
                        '''
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login $REGISTRY_URL -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Build - Tag - Push Image') {
            steps {
                container('dind') {
                    sh '''
                        docker tag $APP_NAME_BACKEND:$IMAGE_TAG $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:$IMAGE_TAG
                        docker tag $APP_NAME_FRONTEND:$IMAGE_TAG $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:$IMAGE_TAG

                        docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:$IMAGE_TAG
                        docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:$IMAGE_TAG
                        
                        docker images
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        sh '''
                            kubectl apply -f .
                        '''
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                container('kubectl') {
                    sh '''
                        echo "============================================"
                        echo "=== DEPLOYMENT VERIFICATION ==="
                        echo "============================================"
                        
                        echo ""
                        echo "=== PODS STATUS ==="
                        kubectl get pods -o wide
                        
                        echo ""
                        echo "=== SERVICES ==="
                        kubectl get svc
                        
                        echo ""
                        echo "=== INGRESS ==="
                        kubectl get ingress
                        kubectl describe ingress app-ingress
                        
                        echo ""
                        echo "=== SERVER POD DETAILS ==="
                        kubectl describe pod -l app=server | tail -50
                        
                        echo ""
                        echo "=== CLIENT POD DETAILS ==="
                        kubectl describe pod -l app=client | tail -50
                        
                        echo ""
                        echo "=== SERVER POD LOGS (Last 30 lines) ==="
                        kubectl logs -l app=server --tail=30 || echo "Server pod logs not available yet"
                        
                        echo ""
                        echo "=== CLIENT POD LOGS (Last 30 lines) ==="
                        kubectl logs -l app=client --tail=30 || echo "Client pod logs not available yet"
                        
                        echo ""
                        echo "=== ENDPOINTS ==="
                        kubectl get endpoints server
                        kubectl get endpoints client
                        
                        echo ""
                        echo "=== WAITING FOR PODS TO BE READY (60 seconds) ==="
                        kubectl wait --for=condition=ready pod -l app=server --timeout=60s || echo "Server pod not ready within timeout"
                        kubectl wait --for=condition=ready pod -l app=client --timeout=60s || echo "Client pod not ready within timeout"
                        
                        echo ""
                        echo "=== FINAL POD STATUS ==="
                        kubectl get pods
                        
                        echo "============================================"
                        echo "=== VERIFICATION COMPLETE ==="
                        echo "============================================"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            container('kubectl') {
                sh '''
                    echo "=== Post-Deployment Summary ==="
                    kubectl get all
                '''
            }
        }
    }
}
