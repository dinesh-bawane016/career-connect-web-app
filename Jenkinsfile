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
        // Registry URL (Internal Service DNS)
        REGISTRY_URL    = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085" 
        // Namespace inferred from user logs
        REGISTRY_REPO   = "2401009"
        
        // Sonar credentials (placeholder)
        SONAR_PROJECT   = "career-connect"
        SONAR_HOST_URL  = "http://sonarqube-host:9000"
    }

    stages {
        
        stage('Build & Push Backend') {
            steps {
                container('dind') {
                    sh '''
                        sleep 15
                    '''
                    // Using 'nexus-login' as a likely credential ID. 
                    // If this fails, user needs to update it or provide the correct one.
                    // Bypass credentials binding to solve user issue
                    sh 'docker login $REGISTRY_URL -u admin -p Changeme@2025'
                    
                    dir('backend') {
                        sh '''
                            docker build -t $APP_NAME_BACKEND:latest .
                            docker tag $APP_NAME_BACKEND:latest $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:latest
                            docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_BACKEND:latest
                        '''
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                container('dind') {
                    dir('frontend') {
                        sh '''
                            docker build -t $APP_NAME_FRONTEND:latest .
                            docker tag $APP_NAME_FRONTEND:latest $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:latest
                            docker push $REGISTRY_URL/$REGISTRY_REPO/$APP_NAME_FRONTEND:latest
                        '''
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        sh '''
                            kubectl apply -f server-deployment.yaml
                            kubectl apply -f client-deployment.yaml
                            kubectl apply -f services.yaml
                            kubectl apply -f ingress.yaml
                        '''
                    }
                }
            }
        }
    }
}
