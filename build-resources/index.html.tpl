<!DOCTYPE html>
<html>
    <head>
        <meta name="generator" content="WebIQ">
        <meta name="robots" content="noindex,nofollow">

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <!-- mobile viewport definition -->
        <meta id="viewportMeta" name="viewport" content="width=device-width, maximum-scale=1.0, initial-scale=1.0, user-scalable=0"  />

        <!-- iOS & Android web-app support -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="mobile-web-app-capable" content="yes">
        <link rel="shortcut icon" sizes="196x196" href="pics/system/webiq-icon.svg">
        <link rel="shortcut icon" sizes="128x128" href="pics/system/webiq-icon.svg">
        <link rel="apple-touch-icon" sizes="128x128" href="pics/system/webiq-icon.svg">
        <link rel="apple-touch-icon-precomposed" sizes="128x128" href="pics/system/webiq-icon.svg">

        <!-- visuals library stylesheet -->
        <link rel="stylesheet" type="text/css" href="css/fonts.css">
        <link rel="stylesheet" type="text/css" href="css/controls.css">

        <!-- visuals library js code -->
        <script src="js/visuals.min.js"></script>


        <!-- custom css -->
        <%= custom_css %>

        <!-- custom libs -->
        <%= custom_libs %>

        <!-- project specific code -->
        <script src="js/user-js/user-actions.js"></script>
        <script src="js/user-js/start-scripts.js"></script>
        
        <!-- controls bundle -->
        <script src="js/controls-bundle.min.js"></script>
        
        <!-- custom controls -->

        <%= custom_controls %>

        <title>Smart HMI: Visuals</title>
    </head>
    <body>
        <div class="layout">
            <div class="container login_container">
                <div data-ui="login" class="login">
                     <!-- loading animation - will be replaced by login template on connect -->
                     <div class="loader">
                          <div class="loader-bg-image"></div>
                          <div class="loader-container">
                               <div class="background"></div>
                               <div class="loading"></div>
                               <div class="loading-text">Connecting...</div>
                          </div>
                     </div>
                </div>
            </div>
        </div>

        <!-- <div class="version-info"> visuals 2.11.4 314329a.27483 @ 12-05-2022 09:45:45 </div> -->
    </body>
</html>
