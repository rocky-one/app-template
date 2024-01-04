import {
  Raycaster, Vector2,
  TextureLoader,
  Color,
  MeshPhysicalMaterial,
  SpriteMaterial,
  Sprite,
  AudioListener,
  Audio,
  AudioLoader,
} from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import type { Object3D } from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { CarDoorStatus, doorNames, DoorNames, doorSpriteNames, DoorSpriteNames } from './types';
import type { AnimationManagerOptions, CustomObject3D, CarState } from './types';
import { doorAniamation } from '@/shared/animation';

export default class AnimationManager {
  constructor(options: AnimationManagerOptions) {
    this.options = options;
    this.setCarColor();
    this.createLightLenslare();
    this.createDoorSprite();
    this.initOpenDoorObjs();
    this.initDoorState();
    this.autoChangeColor();
    this.createDoorAudio();
    this.onEvent();
  }
  private doorObjects: Object3D[] = [];
  private state: CarState = {
    doorStatus: CarDoorStatus.Close
  };
  private options: AnimationManagerOptions;
  private lensflares!: {
    lensflare1: Lensflare
    lensflare2: Lensflare
  };
  private autoColorTween: any;
  private openAudio!: Audio;
  private closeAudio!: Audio;
  private createLightLenslare = () => {
    const textLoader = new TextureLoader();
    const texture = textLoader.load('models/lensflare.jpg');
    const lenslareEle = new LensflareElement(texture, 600, 0, new Color(0xffffff));
    const lensflare1 = new Lensflare();
    const lensflare2 = new Lensflare();
    lensflare1.addElement(lenslareEle);
    lensflare2.addElement(lenslareEle);
    this.lensflares = {
      lensflare1,
      lensflare2
    };
    this.closeCarLight();
    const modelObject = this.options.sceneManager.modelObject;
    const light1 = modelObject.scene.getObjectByName('镜头光晕1') as Object3D;
    const light2 = modelObject.scene.getObjectByName('镜头光晕2') as Object3D;
    light1.add(lensflare1 as Object3D);
    light2.add(lensflare2 as Object3D);
  };
  private initDoorState = () => {
    const modelObject = this.options.sceneManager.modelObject;
    doorNames.forEach(name => {
      const door = modelObject.scene.getObjectByName(name) as CustomObject3D;
      if (!door.state?.doorStatus) {
        door.state = {
          doorStatus: CarDoorStatus.Close
        };
      }
      const openCallback = {
        onStart: () => { this.openAudio?.play();},
      };
      const closeCallback = {
        onComplete: () => { this.closeAudio?.play();}
      };
      if (name === DoorNames.RightFront || name === DoorNames.RightBack) {
        door.state.open = doorAniamation('y', 0, Math.PI / 3, door, openCallback);
        door.state.close = doorAniamation('y', Math.PI / 3, 0, door, closeCallback);
      } else if (name === DoorNames.LeftFront || name === DoorNames.LeftBack) {
        door.state.open = doorAniamation('y', 0, -Math.PI / 3, door, openCallback);
        door.state.close = doorAniamation('y', -Math.PI / 3, 0, door, closeCallback);
      } else if (name === DoorNames.Back) {
        door.state.open = doorAniamation('z', 0, Math.PI / 3, door, openCallback);
        door.state.close = doorAniamation('z', Math.PI / 3, 0, door, closeCallback);
      }
    });
  };
  private createDoorSprite = () => {
    const spritePoint = new TextureLoader().load('models/light_point.png');
    const spriteList: Sprite[] = [];
    const baseScale = 30;
    const modelObject = this.options.sceneManager.modelObject;
    doorSpriteNames.forEach(name => {
      const spriteMaterial = new SpriteMaterial({
        map: spritePoint,
        transparent: true,
      });
      const sprite = new Sprite(spriteMaterial);
      const obj = modelObject.scene.getObjectByName(name) as Object3D;
      sprite.scale.set(baseScale, baseScale, 1);
      sprite.name = `${obj.parent?.name || ''}-sprite`;
      obj.add(sprite);
      spriteList.push(sprite);
      if (name === DoorSpriteNames.RightFront || name === DoorSpriteNames.RightBack) {
        sprite.position.z -= sprite.scale.x / 2;
      } else if (name === DoorSpriteNames.LeftFront || name === DoorSpriteNames.LeftBack) {
        sprite.position.z += sprite.scale.x / 2;
      }
      if (name === DoorSpriteNames.Back) {
        sprite.position.x += sprite.scale.x / 2;
      }
    });
    let scale = 0;
    const spriteAnimation = () => {
      scale += 0.01;
      spriteList.forEach(s => {
        if (scale < 0.5) {
          s.scale.x = baseScale * (1 + scale);
          s.scale.y = baseScale * (1 + scale);
        } else if (scale >= 0.5 && scale < 1) {
          s.scale.x = baseScale * (2 - scale);
          s.scale.y = baseScale * (2 - scale);
        } else {
          scale = 0;
        }
      });
      requestAnimationFrame(spriteAnimation);
    };
    spriteAnimation();
  };
  private initOpenDoorObjs = () => {
    const modelObject = this.options.sceneManager.modelObject;
    doorSpriteNames.forEach(name => {
      const obj = modelObject.scene.getObjectByName(name)?.children[0] as Object3D;
      this.doorObjects.push(obj);
    });
  };
  private createDoorAudio = () => {
    const audioListener = new AudioListener();
    this.openAudio = new Audio(audioListener);
    this.closeAudio = new Audio(audioListener);
    const audioLoader = new AudioLoader();
    audioLoader.load('models/open.wav', (buffer) => {
      this.openAudio.setBuffer(buffer);
      this.openAudio.setVolume(0.6);
    });
    audioLoader.load('models/close.wav', (buffer) => {
      this.closeAudio.setBuffer(buffer);
      this.closeAudio.setVolume(0.6);
    });
  };
  private onEvent = () => {
    const { eventBase } = this.options.sceneManager;
    eventBase.on('onClick', this.onClick);
  };
  onClick = (e: MouseEvent) => {
    const { offsetX, offsetY } = e;
    const info = this.options.sceneManager.getSizeInfo();
    const x = (offsetX / info.width) * 2 - 1;
    const y = -(offsetY / info.height) * 2 + 1;
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2(x, y), this.options.sceneManager.camera);
    const intersects = ray.intersectObjects(this.doorObjects);
    if (intersects.length > 0) {
      const obj = intersects[0].object as CustomObject3D;
      const parent = obj.parent?.parent as CustomObject3D;
      const name = obj.name.split('-')[0];
      if (parent.state?.doorStatus === CarDoorStatus.Close) {
        this.openDoorByName(name as DoorNames);
      } else {
        this.closeDoorByName(name as DoorNames);
      }
    }
  };
  setCarColor = (color?: string) => {
    const material = new MeshPhysicalMaterial({
      color: color || 0xDC143C,
      clearcoat: 1,
      clearcoatRoughness: 0.01,
      metalness: 0.9,
      roughness: 0.5,
      envMapIntensity: 2.5,
    });
    this.options.sceneManager.modelObject.scene.traverse((object: any) => {
      if (object.name.startsWith('外壳')) {
        object.material = material;
      }
    });
  };
  setCarRGB = (r: number, g: number, b: number) => {
    this.options.sceneManager.modelObject.scene.traverse((object: any) => {
      if (object.name.startsWith('外壳')) {
        object.material.color.setRGB(r, g, b);
      }
    });
  };
  autoChangeColor = () => {
    const color16 = [0xDC143C, 0x0000FF, 0xFFD700, 0x000000, 0xffffff];
    const color10 = color16.map(c => new Color(c));
    const initalColor = {
      r: color10[0].r,
      g: color10[0].g,
      b: color10[0].b
    };
    
    const tweens: any = [];
    color10.forEach((c, index) => {
      if (index > 0 && index < color10.length - 1) {
        const tween = new TWEEN.Tween(initalColor);
        tween.to({
          r: c.r,
          g: c.g,
          b: c.b
        }, 600);
        tween.delay(2000);
        tween.onUpdate(() => {
          this.setCarRGB(initalColor.r, initalColor.g, initalColor.b);
        });
        tweens.push(tween);
      } else if (index === color10.length - 1) {
        const tween2 = new TWEEN.Tween(initalColor);
        tween2.to({
          r: color10[0].r,
          g: color10[0].g,
          b: color10[0].b
        }, 600);
        tween2.delay(2000);
        tween2.onUpdate(() => {
          this.setCarRGB(initalColor.r, initalColor.g, initalColor.b);
        });
        tweens.push(tween2);
      }
    });
    for (let i = 0; i < tweens.length - 1; i++) {
      tweens[i].chain(tweens[i + 1]);
    }
    tweens[tweens.length - 1].chain(tweens[0]);
    tweens[0].start();
    this.autoColorTween = tweens[0];
  };
  autoChangeColorStop = () => {
    this.autoColorTween.stop();
  };
  autoChangeColorStart = () => {
    this.autoColorTween.start();
  };
  openDoorByName = (name: DoorNames) => {
    const modelObject = this.options.sceneManager.modelObject;
    const door = modelObject.scene.getObjectByName(name) as CustomObject3D;
    if (door?.state?.doorStatus === CarDoorStatus.Close) {
      door.state.doorStatus = CarDoorStatus.Open;
      door.state.open?.start();
    }
  };
  closeDoorByName = (name: DoorNames) => {
    const modelObject = this.options.sceneManager.modelObject;
    const door = modelObject.scene.getObjectByName(name) as CustomObject3D;
    if (door?.state?.doorStatus === CarDoorStatus.Open) {
      door.state.doorStatus = CarDoorStatus.Close;
      door.state.close?.start();
    }
  };
  openDoors = () => {
    if (this.state.doorStatus === CarDoorStatus.Open) return;
    this.state.doorStatus = CarDoorStatus.Open;
    doorNames.forEach(name => {
      this.openDoorByName(name);
    });
  };
  closeDoors = () => {
    if (this.state.doorStatus === CarDoorStatus.Close) return;
    this.state.doorStatus = CarDoorStatus.Close;
    doorNames.forEach(name => {
      this.closeDoorByName(name);
    });
  };
  openCarLight = () => {
    this.lensflares.lensflare1.visible = true;
    this.lensflares.lensflare2.visible = true;
  };
  closeCarLight = () => {
    this.lensflares.lensflare1.visible = false;
    this.lensflares.lensflare2.visible = false;
  };
}
