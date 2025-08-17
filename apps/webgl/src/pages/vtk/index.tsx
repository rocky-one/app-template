import { useEffect } from 'react';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Misc/RenderingAPIs';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkVolume  from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper  from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkLight from '@kitware/vtk.js/Rendering/Core/Light';
import vtkVolumeProperty from '@kitware/vtk.js/Rendering/Core/VolumeProperty';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import styles from './style.module.less';

// 定义一个名为Vtk的函数，返回一个JSX元素
function Vtk(): JSX.Element {

  const createVolumeView = (renderer: any, source: any) => {
    const volume = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
  
    volume.setMapper(mapper);
    mapper.setInputData(source);
  
    // Add one positional light
    const bounds = volume.getBounds();
    const center = vtkBoundingBox.getCenter(bounds);
    renderer.removeAllLights();
    const light = vtkLight.newInstance();
    const lightPos = [center[0] + 300, center[1] + 50, center[2] - 50];
    light.setPositional(true);
    light.setLightType('SceneLight');
    light.setPosition(lightPos);
    light.setFocalPoint(center);
    light.setColor(1, 1, 1);
    light.setIntensity(1.0);
    light.setConeAngle(50.0);
    renderer.addLight(light);
  
    // Set up sample distance and initialize volume shadow related paramters
    const sampleDistance =
      0.7 *
      Math.sqrt(
        source
          .getSpacing()
          .map((v) => v * v)
          .reduce((a, b) => a + b, 0)
      );
    mapper.setSampleDistance(sampleDistance / 2.5);
    mapper.setComputeNormalFromOpacity(false);
    mapper.setGlobalIlluminationReach(0.0);
    mapper.setVolumetricScatteringBlending(0.5);
    mapper.setVolumeShadowSamplingDistFactor(5.0);
  
    // Set volume properties
    const volProp = vtkVolumeProperty.newInstance();
    volProp.setInterpolationTypeToLinear();
    volume
      .getProperty()
      .setScalarOpacityUnitDistance(
        0,
        vtkBoundingBox.getDiagonalLength(source.getBounds()) /
          Math.max(...source.getDimensions())
      );
    volProp.setGradientOpacityMinimumValue(0, 0);
    const dataArray =
      source.getPointData().getScalars() || source.getPointData().getArrays()[0];
    const dataRange = dataArray.getRange();
    volume
      .getProperty()
      .setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
    volProp.setShade(true);
    volProp.setUseGradientOpacity(0, false);
    volProp.setGradientOpacityMinimumOpacity(0, 0.0);
    volProp.setGradientOpacityMaximumOpacity(0, 1.0);
    volProp.setAmbient(0.0);
    volProp.setDiffuse(2.0);
    volProp.setSpecular(0.0);
    volProp.setSpecularPower(0.0);
    volProp.setUseLabelOutline(false);
    volProp.setLabelOutlineThickness(2);
    volume.setProperty(volProp);
    const cam = renderer.getActiveCamera();
    cam.setPosition(0, 0, 0);
    cam.setFocalPoint(-1, -1, 0);
    cam.setViewUp(0, 0, -1);
    renderer.addVolume(volume);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return volume;
  };

  function resizeViewportContainer(view, ren, element) {
    const rect = view.getBoundingClientRect();
    const vp = ren.getViewport();
    const border = 5;
    const width = (vp[2] - vp[0]) * rect.width - border;
    const height = (vp[3] - vp[1]) * rect.height - border;
    const x = vp[0] * rect.width;
    const y = vp[1] * rect.height;
    element.style.position = 'absolute';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.left = `${x}px`;
    element.style.bottom = `${y}px`;
    element.style.border = `solid ${border}px darkcyan`;
  }
  

  function applyStyle(view, ren, element) {
    element.classList.add('renderer');
    element.style.margin = '0px';
    element.style.display = 'block';
    element.style.boxSizing = 'border';
    element.style.textAlign = 'center';
    element.style.color = 'gray';
    element.style.borderRadius = '5px';
    resizeViewportContainer(view, ren, element);
    return element;
  }
  
  function bindInteractor(interactor, el, tStyle, iStyle) {
    if (interactor.getContainer() !== el) {
      if (interactor.getContainer()) {
        interactor.unbindEvents();
      }
      if (el) {
        const { id } = el;
        if (id === '3') {
          interactor.setInteractorStyle(tStyle);
        } else {
          interactor.setInteractorStyle(iStyle);
        }
        interactor.bindEvents(el);
      }
    }
  }
  const createViews = (myContainer: HTMLDivElement, binary: ArrayBuffer) => {
    const renderWindow = vtkRenderWindow.newInstance();
    const renderWindowView = renderWindow.newAPISpecificView();
    const rect = myContainer.getBoundingClientRect();
    renderWindowView.setSize(rect.width, rect.height);
    renderWindow.addView(renderWindowView);
    renderWindowView.setContainer(myContainer);

    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setView(renderWindowView);
    interactor.initialize();
    
    const iStyle = vtkInteractorStyleImage.newInstance();
    const tStyle = vtkInteractorStyleTrackballCamera.newInstance();
    interactor.setInteractorStyle(tStyle);

    const volume = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();

    const reader = vtkXMLImageDataReader.newInstance();
    reader.parseAsArrayBuffer(binary);
    const im = reader.getOutputData();

    volume.setMapper(mapper);
    mapper.setInputData(im);

    const RENDERERS: any[] = [];

    for (let i = 0; i < 2; ++i) {
      for (let j = 0; j < 2; ++j) {
        const ren = vtkRenderer.newInstance();
        ren.setViewport(
          (i % 2) * 0.51 + 0.01,
          (j % 2) * 0.51 + 0.01,
          (i % 2) * 0.5 + 0.48,
          (j % 2) * 0.5 + 0.48
        );
        const container = applyStyle(
          myContainer,
          ren,
          document.createElement('div')
        );
        container.id = RENDERERS.length;
        myContainer.appendChild(container);
        container.addEventListener('pointerenter', () =>
          bindInteractor(interactor, container, tStyle, iStyle)
        );
        container.addEventListener('pointerleave', () =>
          bindInteractor(interactor, null, tStyle, iStyle)
        );
  
        renderWindow.addRenderer(ren);
        RENDERERS.push(ren);
        // CONTAINERS.push(container);
      }
    }

    const ctf = vtkColorTransferFunction.newInstance();
    ctf.addRGBPoint(0, 0, 0.25, 0.15);
    ctf.addRGBPoint(600, 0.5, 0.5, 0.5);
    ctf.addRGBPoint(3120, 0.2, 0, 0);
    const pf = vtkPiecewiseFunction.newInstance();
    pf.addPoint(0, 0.0);
    pf.addPoint(100, 0.0);
    pf.addPoint(3120, 1.0);

    const amapper = vtkImageResliceMapper.newInstance();
    const cmapper = vtkImageResliceMapper.newInstance();
    const smapper = vtkImageResliceMapper.newInstance();

    const aslicePlane = vtkPlane.newInstance();
    aslicePlane.setNormal(0, 0, 1);
    amapper.setSlicePlane(aslicePlane);
    const aactor = vtkImageSlice.newInstance();
    aactor.setMapper(amapper);
    aactor.getProperty().setColorWindow(2120);
    aactor.getProperty().setColorLevel(2000);
    aactor.getProperty().setRGBTransferFunction(0, ctf);
    RENDERERS[0].addActor(aactor);
    let cam = RENDERERS[0].getActiveCamera();
    cam.setParallelProjection(true);

    const cslicePlane = vtkPlane.newInstance();
    cslicePlane.setNormal(0, 1, 0);
    cmapper.setSlicePlane(cslicePlane);
    const cactor = vtkImageSlice.newInstance();
    cactor.setMapper(cmapper);
    cactor.getProperty().setColorWindow(3120);
    cactor.getProperty().setColorLevel(100);
    cactor.getProperty().setPiecewiseFunction(pf);
    RENDERERS[1].addActor(cactor);
    cam = RENDERERS[1].getActiveCamera();
    cam.setParallelProjection(true);
    cam.setPosition(0, 0, 0);
    cam.setFocalPoint(0, 1, 0);
    cam.setViewUp(0, 0, -1);

    const sslicePlane = vtkPlane.newInstance();
    sslicePlane.setNormal(1, 0, 0);
    smapper.setSlicePlane(sslicePlane);
    const sactor = vtkImageSlice.newInstance();
    sactor.setMapper(smapper);
    sactor.getProperty().setColorWindow(3120);
    sactor.getProperty().setColorLevel(1000);
    cam = RENDERERS[2].getActiveCamera();
    cam.setParallelProjection(true);
    cam.setPosition(0, 0, 0);
    cam.setFocalPoint(1, 0, 0);
    cam.setViewUp(0, 0, -1);
    RENDERERS[2].addActor(sactor);

    const bds: number[] = im.extentToBounds(im.getExtent());
    amapper.setInputData(im);
    aslicePlane.setOrigin(bds[0], bds[2], 0.5 * (bds[5] + bds[4]));

    cmapper.setInputData(im);
    cslicePlane.setOrigin(bds[0], 0.5 * (bds[3] + bds[2]), bds[4]);

    smapper.setInputData(im);
    sslicePlane.setOrigin(0.5 * (bds[1] + bds[0]), bds[2], bds[4]);
    
    const vol = createVolumeView(RENDERERS[3], im);
    vol.getProperty().setRGBTransferFunction(0, ctf);
    vol.getProperty().setScalarOpacity(0, pf);
    
    RENDERERS.forEach((r) => r.resetCamera());
    renderWindow.render();

  };

  useEffect(() => {
    HttpDataAccessHelper.fetchBinary(
      'http://localhost:5173/head-binary.vti',
    ).then((binary: ArrayBuffer) => {
      const ele = document.querySelector('#vtkViews');
      if (ele) {
        ele.innerHTML = '';
      }
      createViews(document.querySelector('#vtkViews')!, binary);
    });
  }, []);

  return <div className={styles['vtk-container']}>
    <div className={styles.wapper} id="vtkViews" />
  </div>;
}

export default Vtk;