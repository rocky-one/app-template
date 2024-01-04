import type { Object3D} from 'three';
import type { SceneManager } from './sceneManager';

export interface CarOptions {
  container: HTMLElement
}

export enum CarDoorStatus {
  Close = 'close',
  Open = 'open'
}

export interface CarState {
  doorStatus: CarDoorStatus
}

export interface EventBaseOptions {
  container: HTMLElement,
}

export interface AnimationManagerOptions extends EventBaseOptions {
  sceneManager: SceneManager
}

export interface CustomObject3D extends Object3D { 
  state?: {
    doorStatus?: CarDoorStatus
    open?: any
    close?: any
  }
}

export enum DoorNames {
  RightFront = '右前门',
  RightBack = '右后门',
  LeftFront = '左前门',
  LeftBack = '左后门',
  Back = '后备箱'
}

export const doorNames = [
  DoorNames.RightBack,
  DoorNames.RightFront,
  DoorNames.LeftBack,
  DoorNames.LeftFront,
  DoorNames.Back
];

export enum DoorSpriteNames {
  RightFront = '右前光标',
  RightBack = '右后光标',
  LeftFront = '左前光标',
  LeftBack = '左后光标',
  Back = '后备箱光标'
}

export const doorSpriteNames = [
  DoorSpriteNames.RightBack,
  DoorSpriteNames.RightFront,
  DoorSpriteNames.LeftBack,
  DoorSpriteNames.LeftFront,
  DoorSpriteNames.Back
];

export type LoadAssetTypes = 'texture' | 'gltf' | 'glb' | 'audio';

export interface LoadOptions {
  url: string
  type: LoadAssetTypes
  name: string
}

export type EventTypes = Record<string, string>