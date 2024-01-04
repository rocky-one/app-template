import { useEffect, useState, useRef } from 'react';
import type EventEmitter from 'eventemitter3';
import { isEqual } from 'lodash-es';
import { nextTick } from '@/shared/microTask';

export const useObervable = <E extends EventEmitter, R> (emitter: E, eventNames: string[]): R => {
  const [_, setRefresh] = useState(0);
  const dataRef = useRef({
    data: {},
    refreshId: 0,
  });

  useEffect(() => {
    if (!emitter) return;
    let task = 0;
    const dataMap = {};
    const updateData = (name: string) => { 
      return (data: R) => {
        dataMap[name] = data;
        task++;
        nextTick(() => {
          task--;
          if (task === 0 && !isEqual(data, dataRef.current.data)) {
            dataRef.current.data = dataMap;
            setRefresh(++dataRef.current.refreshId);
          }
        });
      };
    };
    eventNames.forEach(name => emitter.on(name, updateData(name)));
    return () => {
      eventNames.forEach(name => emitter.off(name, updateData(name)));
    };
  }, [emitter, eventNames]);

  return dataRef.current.data as R;
};

export const onProxy = <T extends object> (data: T, callback: (data: T) => void) => {
  const proxyData = new Proxy(data, {
    set (target, propKey, value, receiver) {
      callback(data);
      return Reflect.set(target, propKey, value, receiver);
    }
  });
  return proxyData;
};