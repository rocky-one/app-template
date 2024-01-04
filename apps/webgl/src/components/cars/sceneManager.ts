import {
  WebGLRenderer, Scene,
  PerspectiveCamera, Color, Fog,
  Mesh, PlaneGeometry,
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  AxesHelper,
  Group,
  RepeatWrapping,
  MeshLambertMaterial,
  SRGBColorSpace,
  DirectionalLight,
  AmbientLight,
  SphereGeometry,
  MeshPhongMaterial,
  BackSide,
  CircleGeometry,
  Vector3,
  Quaternion,
  Matrix4,
} from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import type { Object3D } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import EventEmitter from 'eventemitter3';
import type { CarOptions, EventTypes } from './types';
import EventBase from './eventBase';
import AnimationManager from './animationManager';
import CSSRender from './cssRender';
import { Loader } from './loader';

export class SceneManager extends EventEmitter {
  constructor(options: CarOptions) {
    super();
    this.options = options;
    void this.init();
  }
  private options: CarOptions;
  private renderer!: WebGLRenderer;
  private controls!: OrbitControls;
  private width!: number;
  private height!: number;
  scene!: Scene;
  cssRender!: CSSRender;
  camera!: PerspectiveCamera;
  modelObject!: GLTF;
  eventBase!: EventBase;
  animationManager: AnimationManager | null = null;
  loader!: Loader;
  events: EventTypes = {
    loaded: 'loaded'
  };

  private init = async (): Promise<void> => {
    this.initSize();
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.createHall();
    this.onResize();
    this.initEvent();
    await this.createLoader();
    this.createControls();
    await this.createGround();
    this.createLights();
    this.createAxesHelper();
    this.cssRender = new CSSRender({ 
      sceneManager: this,
      container: this.options.container
    });
    this.emit(this.events.loaded);
    this.emit(this.events.loaded);
  };
  private initSize = () => {
    const { offsetWidth, offsetHeight } = this.options.container;
    this.width = offsetWidth;
    this.height = offsetHeight;
  };
  private createRenderer = (): void => {
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.options.container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(this.render);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.outputColorSpace = SRGBColorSpace;
  };
  private createScene = (): void => {
    this.scene = new Scene();
    this.scene.background = new Color(0xeeeeee);
    this.scene.environment = new RGBELoader().load('venice_sunset_1k.hdr');
    this.scene.environment.mapping = EquirectangularReflectionMapping;
    this.scene.fog = new Fog(0xeeeeee, 1, 8000);
  };
  private createCamera = (): void => {
    this.camera = new PerspectiveCamera(40, this.width / this.height, 1, 30000);
    this.camera.position.set(-600, 300, 400);
    this.camera.lookAt(0, 0, 0);
  };
  private createControls = (): void => {
    this.controls = new OrbitControls(this.camera, this.options.container);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  };
  private createLoader = async (): Promise<void> => {
    this.loader = new Loader();
    // this.loader.on('load-async-progress', (name, loaded, total) => {
    //   console.log(name, '加载:', `${(loaded / total * 100).toFixed(0)  }%`, );
    // });
    await this.loader.loadAsync({
      name: 'gltf-car',
      url: 'models/轿车.glb',
      type: 'gltf'
    });
    const modelObject = this.loader.getModelByName('gltf-car');
    if (modelObject) {
      this.modelObject = modelObject;
      const group = new Group();
      group.add(modelObject.scene as Object3D);
      this.scene.add(group as Object3D);
      
      this.animationManager = new AnimationManager({
        container: this.options.container,
        sceneManager: this
      });
    }
  };
  private createGround = async () => {
    const groundGeometry = new PlaneGeometry(6000, 6000);
    await this.loader.loadAsync({
      name: 'ground',
      url: 'models/ground.jpg',
      type: 'texture'
    });
    const texture = this.loader.getTextureByName('ground');
    if (texture) {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(12, 12);
      const material = new MeshLambertMaterial({
        color: 0xffffff,
        map: texture,
      });
      const mesh = new Mesh(groundGeometry, material);
      mesh.rotateX(-Math.PI / 2);
      this.scene.add(mesh);
    }
  };
  private createLights = () => {
    const scene = this.scene;
    const directionalLight = new DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(400, 200, 300);
    scene.add(directionalLight);

    const directionalLight2 = new DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-400, -200, -300);
    scene.add(directionalLight2);

    const ambient = new AmbientLight(0xffffff, 1);
    scene.add(ambient);
  };
  private createHall = () => {
    const group = new Group();
    const r = 1000;
    const sphereGeometry = new SphereGeometry(r, 10, 10);
    const meshPhongMaterial = new MeshPhongMaterial({
      color: 0xdcdcdc,
      specular: 0x111111,
      side: BackSide, 

    });
    const mesh = new Mesh(sphereGeometry, meshPhongMaterial);
    group.add(mesh);

    const sphereGeometry2 = new SphereGeometry(r, 10, 10);
    const position = sphereGeometry2.attributes.position;
    const circleGeometry = new CircleGeometry(20, 15, 15);
    for (let i = 0; i < position.count; i++) {
      const cirMaterial = new MeshLambertMaterial({
          color: 0xffffff,
          side: BackSide,
      });
      // cirMaterial.color.r = Math.random() * 0.7 + 0.3;
      // cirMaterial.color.g = cirMaterial.color.r;
      // cirMaterial.color.b = cirMaterial.color.r;
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const v1 = new Vector3(0, 0, 1); //垂直屏幕的方向  z轴方向
      const v2 = new Vector3(x, 0, z).normalize(); //圆柱y设置为0
      const q = new Quaternion();
      q.setFromUnitVectors(v1, v2);
      const M = new Matrix4();
      M.makeRotationFromQuaternion(q);
      const planeMesh = new Mesh(circleGeometry, cirMaterial); //网格模型对象Mesh
      planeMesh.applyMatrix4(M);
      planeMesh.position.set(x, y, z);
      group.add(planeMesh);
  }

    console.log(position, 'position');
    this.scene.add(group);
  };
  private createAxesHelper = () => {
    this.scene.add(new AxesHelper(200));
  };
  onResize = () => {
    window.onresize = () => {
      const { offsetWidth, offsetHeight } = this.options.container;
      this.width = offsetWidth;
      this.height = offsetHeight;
      this.renderer.setSize(this.width, this.height);
      this.cssRender.renderer2d.setSize(this.width, this.height);
      this.cssRender.renderer3d.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    };
  };
  private initEvent = () => {
    this.eventBase = new EventBase({
      container: this.options.container,
    });
  };
  private render = (): void => {
    this.renderer.render(this.scene, this.camera);
    if (this.cssRender) {
      this.cssRender.renderer2d.render(this.scene, this.camera);
      this.cssRender.renderer3d.render(this.scene, this.camera);
    }
    TWEEN.update();
  };
  getOptions() {
    return this.options;
  }
  getSizeInfo() {
    return {
      width: this.width,
      height: this.height,
    };
  }
  destroy = (): void => {
    this.renderer.dispose();
    // this.cssRender.renderer2d.dispose();
    // this.cssRender.renderer3d?.dispose();
  };
}