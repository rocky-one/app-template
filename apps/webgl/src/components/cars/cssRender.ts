import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import type { Object3D } from 'three';
import type { SceneManager } from './sceneManager';

interface CssRenderOptions {
  sceneManager: SceneManager;
  container: HTMLElement;
}

export default class CSSRender {
  constructor(options: CssRenderOptions) {
    this.options = options;
    this.create2DRenderer();
    this.create3DRenderer();
  }
  private options: CssRenderOptions;
  renderer2d!: CSS2DRenderer;
  renderer3d!: CSS3DRenderer;
  create2DRenderer = () => {
    const container = this.options.container;
    this.renderer2d = new CSS2DRenderer();
    this.renderer2d.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer2d.domElement.style.position = 'absolute';
    this.renderer2d.domElement.style.top = '0px';
    this.renderer2d.domElement.style.left = '0px';
    this.renderer2d.domElement.style.pointerEvents = 'none';
    container.appendChild(this.renderer2d.domElement);
  };
  create3DRenderer = () => {
    const container = this.options.container;
    this.renderer3d = new CSS3DRenderer;
    this.renderer3d.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer3d.domElement.style.position = 'absolute';
    this.renderer3d.domElement.style.top = '0px';
    this.renderer3d.domElement.style.left = '0px';
    this.renderer3d.domElement.style.pointerEvents = 'none';
    container.appendChild(this.renderer3d.domElement);
  };
  create3DObject = (objectName: string, ele: HTMLElement) => {
    const modelObject = this.options.sceneManager.modelObject;
    const obj = modelObject.scene.getObjectByName(objectName) as Object3D;
    const label = new CSS3DObject(ele);
    obj.add(label as Object3D);
    return label as Object3D;
  };
  create2DObject = (objectName: string, ele: HTMLElement) => {
    const modelObject = this.options.sceneManager.modelObject;
    const obj = modelObject.scene.getObjectByName(objectName) as Object3D;
    const label = new CSS2DObject(ele);
    obj.add(label as Object3D);
    return label as Object3D;
  };
}