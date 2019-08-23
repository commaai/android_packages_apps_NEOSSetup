#!/bin/bash
set -e

cd $(dirname $0)

APK_OUT=${1:-ai.comma.plus.neossetup.apk}
SIGNAPK=${SIGNAPK:="./signapk"}
CEREAL=${CEREAL:="./cereal"}
export SENTRY_SKIP_UPLOAD=${SENTRY_SKIP_UPLOAD:-1}

if [ ! -d $SIGNAPK ]; then
  echo "sign apk not found"
  git clone https://github.com/techexpertize/SignApk.git $SIGNAPK
fi

if [ ! -d $CEREAL ]; then
  echo "cereal not found"
  git clone https://github.com/commaai/cereal.git $CEREAL
fi

pushd $CEREAL
make
popd

export SENTRY_WIZARD_INTEGRATION=reactNative

yarn
node_modules/.bin/react-native link

mkdir -p android/app/src/main/assets
rm android/app/src/main/assets/index.android.bundl* || true
rm -r android/build android/app/build || true

echo "android/app/src/main/res/drawable-mdpi
android/app/src/main/res/drawable-hdpi
android/app/src/main/res/drawable-xhdpi
android/app/src/main/res/drawable-xxhdpi
android/app/src/main/res/drawable-xxxhdpi"| xargs rm -r || true

if [ -z "$DEBUG" ]; then
    APK_PATH=android/app/build/outputs/apk/release/app-release-unsigned.apk
    (cd android && ./gradlew clean && (./gradlew assembleRelease || ./gradlew assembleRelease))
else
    APK_PATH=android/app/build/outputs/apk/debug/app-debug.apk
    (cd android && ./gradlew clean && (./gradlew assembleDebug || ./gradlew assembleDebug))
fi

java -jar $SIGNAPK/signapk.jar $SIGNAPK/certificate.pem $SIGNAPK/key.pk8 $APK_PATH $APK_OUT
echo "build complete"
