package ai.comma.plus.neossetup;

import com.facebook.react.ReactActivity;
import android.util.Log;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "neossetup";
    }

    @Override
    public void finish() {
        super.finish();
        Log.w("neossetup", "finish()");
    }
}
