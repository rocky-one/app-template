import EventEmitter from 'eventemitter3';
import type { EventBaseOptions } from './types';

export default class EventBase extends EventEmitter {
  constructor(options: EventBaseOptions) {
    super();
    this.container = options.container;
    this.onBind();
  }
  private container: HTMLElement;

  private onBind = () => {
    this.container.addEventListener('click', this.onClick);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mousedown', this.onMouseDown);
  };

  private unBind = () => {
    this.container.removeEventListener('click', this.onClick);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mousedown', this.onMouseDown);
  };

  onClick = (e: MouseEvent) => {
    this.emit('onClick', e);
  };

  onMouseMove = (e: MouseEvent) => {
    this.emit('onMouseMove', e);
  };

  onMouseDown = (e: MouseEvent) => {
    this.emit('onMouseDown', e);
  };

  destroy = () => {
    this.unBind();
  };
  
}



