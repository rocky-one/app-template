import EventEmitter from 'eventemitter3';
import type { Texture } from 'three';
import { TextureLoader } from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { LoadOptions } from './types';

export class Loader extends EventEmitter {

  private textureLoader!: TextureLoader;

  private gltfLoader!: GLTFLoader;

  private models: GLTF[] = [];
  
  private textures: Texture[] = [];

  getTextureLoader = (): TextureLoader => {
    if (this.textureLoader) return this.textureLoader;
    this.textureLoader = new TextureLoader();
    return this.textureLoader;
  };

  getGLTFLoader = (): GLTFLoader => {
    if (this.gltfLoader) return this.gltfLoader;
    this.gltfLoader = new GLTFLoader();
    return this.gltfLoader;
  };

  loadAsync = async (options: LoadOptions) => {
    const { url, type, name } = options;
    if (type === 'gltf') {
      const gltf = await this.getGLTFLoader().loadAsync(url, progress => {
        this.emit('load-async-progress', name, progress.loaded, progress.total);
      });
      gltf.userData.name = name;
      this.models.push(gltf);
    } else if (type === 'glb') {
      const glb = await this.getGLTFLoader().loadAsync(url, progress => {
        this.emit('load-async-progress', name, progress.loaded, progress.total);
      });
      glb.userData.name = name;
      this.models.push(glb);
    } else if (type === 'texture') {
      const texture = await this.getTextureLoader().loadAsync(url, progress => {
        this.emit('load-async-progress', name, progress.loaded, progress.total);
      });
      texture.name = name;
      this.textures.push(texture);
    }
  };

  getModelByName = (name: string): GLTF | undefined=> {
    return this.models.find(model => model.userData.name === name);
  };

  getTextureByName = (name: string): Texture | undefined => {
    return this.textures.find(texture => texture.name === name);
  };

}