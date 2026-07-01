workflows:
  ios-capacitor-workflow:
    name: Mater iOS Build
    max_build_duration: 60
    instance_type: mac_mini_m2
    environment:
      ios_signing:
        distribution_type: app_store
        bundle_identifier: org.materapp.app
      vars:
        XCODE_WORKSPACE: "App.xcworkspace"
        XCODE_SCHEME: "App"
        BUILD_NUMBER: "6"
      node: 22.0.0
    scripts:
      - name: Install npm dependencies
        script: |
          npm install
      - name: Install Capacitor dependencies
        script: |
          npm install @capacitor/core @capacitor/cli @capacitor/ios
      - name: Build React app
        script: |
          npm run build
      - name: Copy web assets to iOS
        script: |
          npx cap copy ios
      - name: Set build number
        script: |
          /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" ios/App/App/Info.plist
      - name: Set up code signing
        script: |
          xcode-project use-profiles
      - name: Install CocoaPods dependencies
        script: |
          cd ios/App
          sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*/IPHONEOS_DEPLOYMENT_TARGET = 16.0/g' App.xcodeproj/project.pbxproj
          pod install --repo-update
      - name: Build ipa for App Store distribution
        script: |
          xcode-project build-ipa \
            --workspace "ios/App/$XCODE_WORKSPACE" \
            --scheme "$XCODE_SCHEME"
    artifacts:
      - build/ios/ipa/*.ipa
      - /tmp/xcodebuild_logs/*.log
