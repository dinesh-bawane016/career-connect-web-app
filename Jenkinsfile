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
        // Update these values as required
        APP_NAME_BACKEND = "career-connect-backend"
        APP_NAME_FRONTEND = "career-connect-frontend"
        IMAGE_TAG       = "latest" // Or build number: "${env.BUILD_NUMBER}"
        REGISTRY_URL    = "REGISTRY_HOST:PORT" // Needs modification by user
        REGISTRY_REPO   = "project-namespace" // Needs modification by user
        
        // Sonar credentials (if used)
        SONAR_PROJECT   = "career-connect"
        SONAR_HOST_URL  = "http://sonarqube-host:9000"
    }

    stages {
        
        stage('Build & Push Backend') {
            steps {
                container('dind') {
                    sh '''
                        sleep 15
                        # Login to Registry
                        # It is better to login once if possible, but dind session might need it
                        # Note: Credentials bindings should be wrapped here if registry requires auth
                    '''
                    withCredentials([usernamePassword(credentialsId: 'REGISTRY_CREDENTIALS_ID', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                         sh 'docker login $REGISTRY_URL -u $REG_USER -p $REG_PASS'
                    }
                    
                    dir('backend') {
                        sh '''
                            docker build -t $APP_NAME_BACKEND:$IMAGE_TAG .
                            docker tag $APP_NAME_BACKEND:$IMAGE_TAG $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:$IMAGE_TAG
                            docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:$IMAGE_TAG
                        '''
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                container('dind') {
                   // Login already happened in previous stage if dind info persists, 
                   // but usually safe to re-login or assume session is valid. 
                   // For robustness we can just do the build/push.
                    dir('frontend') {
                        sh '''
                            docker build -t $APP_NAME_FRONTEND:$IMAGE_TAG .
                            docker tag $APP_NAME_FRONTEND:$IMAGE_TAG $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:$IMAGE_TAG
                            docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:$IMAGE_TAG
                        '''
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        // Replace placeholders in YAMLs with environment variables
                        // In a real setup, we might use `envsubst` or similar, 
                        // but here we just apply.
                        // Note: The YAMLs have <NAMESPACE>, <TAG> etc. 
                        // Users are expected to replace them or we do it here.
                        
                        // Using sed to replace placeholders for this deployment 
                        // NOTE: This assumes <NAMESPACE> is replaced by real namespace in jenkins or manually
                        // Let's assume the user has set up the files with correct names or we do a replacement.
                        
                        sh '''
                            # Helper to replace <TAG> and <PROJECT_NAMESPACE> if needed
                            # sed -i "s/<TAG>/$IMAGE_TAG/g" *.yaml
                            # sed -i "s/<PROJECT_NAMESPACE>/$REGISTRY_REPO/g" *.yaml
                            
                            kubectl apply -f backend-deployment.yaml
                            kubectl apply -f backend-service.yaml
                            kubectl apply -f frontend-deployment.yaml
                            kubectl apply -f frontend-service.yaml
                            kubectl apply -f ingress.yaml
                            
                            # Optional: Wait for rollout
                            # kubectl rollout status deployment/$APP_NAME_BACKEND-deployment
                            # kubectl rollout status deployment/$APP_NAME_FRONTEND-deployment
                        '''
                    }
                }
            }
        }
    }
}
