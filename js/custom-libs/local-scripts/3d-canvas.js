
    var ses = shmi.visuals.session; //get reference to session
    var im = ses.ItemManager; //get reference to ItemManager instance
    var io = shmi.visuals.io;
(function () {

    /**
     * replace module name with a custom name for the local-script.
     *
     * All local-script should be attached to the "custom.ls" package.
     * If more than one script is required for an application, a common root package
     * should be created (e.g. "custom.ls.customerName.*").
     */

    var MODULE_NAME = "3d-canvas",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg( MODULE_NAME );

    // MODULE CODE - START
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var renderer;
    var scene;
    var camera;
    var obj_3d;
    let infoPanel;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = 0; windowHalfY = 0;
    let material;
    let directionalLight;
    let sphereColorTween, sphereScaleTween;
    let sceneMeshes = [];
    
    loadResourceCallback = function(object){
        object.position.y = -350;
        object.position.x = -250;
        object.position.z = 0;
        obj_3d = object;
    };
    
    function addShadowedLight( x, y, z, color, intensity ) {
	directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
	directionalLight.castShadow = true;
	const d = 400;
	directionalLight.shadow.camera.left = - d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = - d;
	directionalLight.shadow.camera.near = 200;
	directionalLight.shadow.camera.far = 2000;
	directionalLight.shadow.mapSize.width = 4096;
	directionalLight.shadow.mapSize.height = 4096;
	directionalLight.shadow.bias = - 0.001;
	scene.add( directionalLight );
// 	const helper = new THREE.DirectionalLightHelper(directionalLight,100);
//  	scene.add(helper);
//  	const helper2 = new THREE.CameraHelper(directionalLight.shadow.camera);
//     scene.add(helper2);
    }
    
    function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
    function onDocumentMouseMove( event ) {
		mouseX = ( event.clientX - windowHalfX ) / 2;
		mouseY = ( event.clientY - windowHalfY ) / 2;
	}
	
	function animate() {
		requestAnimationFrame( animate );
		TWEEN.update();
		render();
	}
	
	function render() {
		renderer.render( scene, camera );
	}
	
	function loadModel() {
		obj_3d.traverse( function ( child ) {
		    if ( child.isMesh )
		        //child.material = material;
		        child.castShadow = true;
		        child.receiveShadow = true;
		        sceneMeshes.push(child);
		});
		scene.add(obj_3d);
		
	}
	
	function addSphere(position, name, size){
	    const geometry = new THREE.SphereGeometry( size, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xf20c0c } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(position.x, position.y, position.z);
        sphere.name = name;
        // Color animation
        var colorStart = new THREE.Color(0xf50000);
        var colorEnd = new THREE.Color(0xffd6d6);
        sphereColorTween = new TWEEN.Tween(sphere.material.color).to(colorEnd, 2000).easing(TWEEN.Easing.Quadratic.InOut).yoyo(true).repeat(Infinity);
        sphereColorTween.start();
        // Scale animation
        var targetScale = new THREE.Vector3(0.8,0.8,0.8);
        sphereScaleTween = new TWEEN.Tween(sphere.scale).to(targetScale,2000).easing(TWEEN.Easing.Quadratic.InOut).yoyo(true).repeat(Infinity);
        sphereScaleTween.start();
        sceneMeshes.push(sphere);
        scene.add( sphere );
	}
	
	function onDocumentMouseDown( event ) {

        event.preventDefault();
    
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    
        raycaster.setFromCamera( mouse, camera );
    
        var intersects = raycaster.intersectObjects( sceneMeshes );
        if (intersects.length > 0){
            intersects.forEach(function(obj){
                if (obj.object.name.includes("alm")){
                    toggleAlarmData(obj.object.name, true);
                }
            })
        } else {
            toggleAlarmData({},false);
        }
        

    }
    
    function toggleAlarmData(name, show){
        if(show){
            let nameText = document.querySelector('[data-name=iq-text]');
            let troubleshootingLabel = document.querySelector('[data-name=iq-text_1]');
            troubleshootingLabel.firstChild.children[0].children[0].children[0].textContent = "Troubleshooting:";
            let troubleshootingText = document.querySelector('[data-name=iq-text_2]');
            let timeText = document.querySelector('[data-name=iq-text_3]');
            switch(name){
                case 'almGripper':
                    nameText.firstChild.children[0].children[0].children[0].textContent = 'EOAT Gripper Timeout';
                    troubleshootingText.firstChild.children[0].children[0].children[0].textContent = ' *Check pneumatic lines\n *Confirm extend/retract sensor function\n *Verify timeout setting'
                    timeText.firstChild.children[0].children[0].children[0].textContent = 'Alarm Time: 8/31/2022 15:17:22'
                    break;
                case 'almJ3':
                    nameText.firstChild.children[0].children[0].children[0].textContent = 'J3 Motor Fault';
                    troubleshootingText.firstChild.children[0].children[0].children[0].textContent = ' *Check for axis obstruction\n *Confirm power supply voltage';
                    timeText.firstChild.children[0].children[0].children[0].textContent = 'Alarm Time: 8/31/2022 15:27:55'
                    break;
                default:
                    break;
            }
            
            //EOAT Gripper Close Timeout
            jQuery('[data-name=info-panel]').animate({width:'20%'},1000);
            jQuery('.iq-text').fadeIn(1000);
        } else {
            jQuery('[data-name=info-panel]').animate({width:'0%'},1000);
            jQuery('.iq-text').fadeOut(1000);
        }
    }
    
    
    function writeCallback(){};
    
	
    /**
     * Implements local-script run function.
     *
     * This function will be called each time a local-script will be enabled.
     *
     * @param {LocalScript} self instance reference of local-script control
     */
    module.run = function (self) {

        //Place your Code here
        var body = document.body;
        let container = document.createElement( 'div' );
        let windowHalfX = window.innerWidth / 2;
		let windowHalfY = window.innerHeight / 2;
		body.appendChild( container );
        renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		container.appendChild( renderer.domElement );
		infoPanel = document.querySelectorAll('[data-name=info-panel]');
		infoPanel.width = '0px';
		window.addEventListener( 'resize', onWindowResize );
		window.addEventListener('mousedown', onDocumentMouseDown);
        
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = -1200;
        
        // Generate Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x72645b );
		scene.fog = new THREE.Fog( 0x72645b, 1000, 2000 );
		
		const axesHelper = new THREE.AxesHelper( 1000 );
        scene.add( axesHelper )
        
        // Ground
		const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(4000, 4000),
		new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } ));
		plane.rotation.x = - Math.PI / 2;
		plane.position.y = -350;
		scene.add( plane );
		plane.receiveShadow = true;
        
        // Lighting
        scene.add( new THREE.HemisphereLight( 0x443333, 0x111122,4) );
        
		addShadowedLight( 300, 300, -300, 0xFCFF00, 0.8 );
        
        // Load object
        const manager = new THREE.LoadingManager( loadModel );
        const objLoader = new THREE.OBJLoader(manager);
        material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
        objLoader.load("resources/Rmk3.obj", loadResourceCallback);
        
        // Add error sphere
        //let spherePos = new THREE.Vector3(200,50,215);
        addSphere(new THREE.Vector3(200,50,215), "almGripper", 16);
        addSphere(new THREE.Vector3(-220,50,-180), "almJ3", 60);
        
        
        // Orbit controls
        const controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.addEventListener( 'change', render ); // use if there is no animation loop
		controls.minDistance = 500;
		controls.maxDistance = 1500;
        
        animate();
        
        im = shmi.requires("visuals.session.ItemManager"),
        itemHandler = im.getItemHandler();

        /* called when this local-script is disabled */
        self.onDisable = function () {
            self.run = false; /* from original .onDisable function of LocalScript control */
        };
    };


    // MODULE CODE - END

    fLog("module loaded");
})();
