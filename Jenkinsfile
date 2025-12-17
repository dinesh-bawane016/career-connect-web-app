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
        IMAGE_TAG       = "latest"
        REGISTRY_URL    = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_REPO   = "2401009"
        SONAR_PROJECT   = "2401009_career-connect"
        SONAR_HOST_URL  = "http://sonarqube-sonarqube-0.sonarqube-sonarqube.svc.cluster.local:9000"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 15
                        docker build -t $APP_NAME_BACKEND:$IMAGE_TAG ./backend
                        docker build -t $APP_NAME_FRONTEND:$IMAGE_TAG ./frontend
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
    }
}
