package ai.comma.plus.neossetup

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import android.provider.Settings
import com.facebook.react.bridge.*
import java.io.IOException
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.telephony.TelephonyManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import android.content.BroadcastReceiver
import com.facebook.react.bridge.WritableNativeMap
import android.net.NetworkInfo
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.wifi.WifiInfo
import android.os.Environment
import android.os.StatFs
import android.util.Base64
import android.util.Log
import io.jsonwebtoken.Jwts
import java.security.GeneralSecurityException
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.spec.InvalidKeySpecException
import java.security.spec.PKCS8EncodedKeySpec
import java.util.regex.Pattern

import android.os.AsyncTask;
import java.net.URL;
import java.net.URLConnection;
import java.io.File;
import java.io.FileOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream


/**
 * Created by batman on 11/2/17.
 */
class ChffrPlusModule(val ctx: ReactApplicationContext) :
        ReactContextBaseJavaModule(ctx) {
    val WIFI_STATE_EVENT_NAME = "WIFI_STATE_CHANGED"

    private var networkMonitor: NetworkMonitor? = null

    override fun getName(): String = "ChffrPlus"

    override fun initialize() {
        super.initialize()

        networkMonitor = NetworkMonitor()
        val filter = IntentFilter(WifiManager.NETWORK_STATE_CHANGED_ACTION)
        filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION)
        ctx.registerReceiver(networkMonitor, filter)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()

        Log.d("neossetup", "catalyst destroyed")
        ctx.unregisterReceiver(networkMonitor)
    }

    private fun startActivityWithIntent(intent: Intent) {
        val currentActivity = currentActivity

        if (currentActivity != null) {
            currentActivity.startActivity(intent)
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    private fun finish() {
        ctx.currentActivity?.finish()
    }

    private fun emitDownloadStatus(status: Boolean) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onDownloadFailed", status)
    }

    private fun createCompletedSetupFile(version: String): File {
        val path = "/sdcard/neos_setup_completed"
        val file = File(path)
        file.createNewFile()
        file.writeText(version)
        return file
    }

    class DownloadApp(private var module: ChffrPlusModule?) : AsyncTask<String, String, String>() {
        override fun doInBackground(vararg params: String): String {
            val outputPath = "/data/data/ai.comma.plus.neossetup/installer"
            var result = "0"
            try {
                val url = URL(params[0])
                val conn = url.openConnection() as URLConnection
                conn.setRequestProperty("User-Agent", "NEOSSetup-0.2")

                val contentLength = conn.getContentLength()
                val inStream = DataInputStream(conn.getInputStream())
                val buffer = ByteArray(contentLength)
                inStream.readFully(buffer);
                inStream.close();

                var tmpPath: String = outputPath + ".tmp"
                val foStream = FileOutputStream(tmpPath)
                val outStream = DataOutputStream(foStream)
                outStream.write(buffer)
                outStream.flush()
                outStream.close()

                File(tmpPath).renameTo(File(outputPath))
                result = "1"
                return result
            } catch (ex: Exception) {
                Log.d("neossetup", "Error in doInBackground " + ex.message)
                return result
            }
            return result
        }

        override fun onPreExecute() {
            super.onPreExecute()
        }

        override fun onPostExecute(result: String) {
            super.onPostExecute(result)
            Log.d("neossetup", result)
            if (result !== "0") {
                try {
                    module?.createCompletedSetupFile(result)
                    module?.finish()
                } catch (e: IOException) {
                    CloudLog.exception("NeosSetup.onPostExecute", e)
                }
            } else {
                module?.emitDownloadStatus(false);
            }
        }
    }

    @ReactMethod
    fun startInstaller(link: String) {
        Log.d("neossetup installer", link);
        DownloadApp(this).execute(link)
    }

    @ReactMethod
    fun openWifiSettings() {
        val intent = Intent(WifiManager.ACTION_PICK_WIFI_NETWORK)
        intent.putExtra("extra_prefs_show_button_bar", true)
        startActivityWithIntent(intent)
    }

    private fun join(byteArray1: ByteArray, byteArray2: ByteArray): ByteArray {
        val bytes = ByteArray(byteArray1.size + byteArray2.size)
        System.arraycopy(byteArray1, 0, bytes, 0, byteArray1.size)
        System.arraycopy(byteArray2, 0, bytes, byteArray1.size, byteArray2.size)
        return bytes
    }

    fun getWifiStateMap(wifiInfo: WifiInfo? = null, networkInfo: NetworkInfo? = null): ReadableNativeMap {
        val map = WritableNativeMap()
        var isConnected: Boolean
        var state: String?
        var ssid: String?

        if (wifiInfo != null && networkInfo != null) {
            isConnected = networkInfo.isConnected
            state = networkInfo.state.toString()
            ssid = wifiInfo.ssid.removePrefix("\"").removeSuffix("\"")
        } else {
            val wifiManager = ctx.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val connManager = ctx.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val netInfo = connManager.activeNetworkInfo
            isConnected = (netInfo?.isConnected ?: false) && netInfo?.type == ConnectivityManager.TYPE_WIFI
            state = netInfo?.state.toString()
            ssid = wifiManager.connectionInfo?.ssid?.removePrefix("\"")?.removeSuffix("\"")
        }

        if (ssid == "<unknown ssid>") ssid = null

        map.putBoolean("isConnected", isConnected)
        map.putString("state", state)
        map.putString("ssid", ssid)

        return map
    }

    @ReactMethod
    fun getWifiState(promise: Promise) {
        promise.resolve(getWifiStateMap())
    }

    fun notifyWifiStateChange(intent: Intent?) {
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            var wifiInfo: WifiInfo? = null
            var netInfo: NetworkInfo? = null
            if (intent != null) {
                wifiInfo = intent.getParcelableExtra<WifiInfo>(WifiManager.EXTRA_WIFI_INFO)
                netInfo = intent.getParcelableExtra<NetworkInfo>(WifiManager.EXTRA_NETWORK_INFO)
            }
            val params = getWifiStateMap(wifiInfo, netInfo)

            reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(WIFI_STATE_EVENT_NAME, params)
        } else {
            Log.d("neossetup", "no active catalyst instance")
        }
    }

    internal inner class NetworkMonitor : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                WifiManager.NETWORK_STATE_CHANGED_ACTION -> notifyWifiStateChange(intent)
                ConnectivityManager.CONNECTIVITY_ACTION -> notifyWifiStateChange(null)
            }
        }
    }
}
