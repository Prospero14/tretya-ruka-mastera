package app.syuzhetnik.bible;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Keep edge-swipe / predictive back inside the WebView / Capacitor App plugin
        // instead of finishing the Activity when history is empty.
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }
                // Inject a soft back into JS; AndroidBackHandler also listens to CapApp.backButton.
                if (webView != null) {
                    webView.evaluateJavascript(
                        "(function(){try{var p=location.pathname||'';if(p.indexOf('/project')===0){location.assign('/');} }catch(e){}})();",
                        null
                    );
                }
                // Do not call finish() — stay in the app on the home screen.
            }
        });
    }
}
