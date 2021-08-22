class Camera {
  constructor({ width, height, boundary, lightingTexture }) {
    this.lightingTexture = lightingTexture;
    this.targetZoom = 1;
    this.currentZoom = 1;
    this.position = { x: 0, y: 0 };
    this.boundary = boundary ? boundary : { x: { min: 0, max: width }, y: { min: 0, max: height }, zoom: { min: 0.2, max: 1 } };
    this.stage = undefined;
    this.targetObject = undefined;
    this.screenWidth = width;
    this.screenHeight = height;
    this.layers = [];
  }

  setStage(stage) {
    this.stage = stage;
  }

  setBoundary(boundary) {
    for (const key in boundary) {
      this.boundary[key] = boundary[key];
    }
  }

  setObject(id, immediately) {
    this.targetObject = Store.objects[id];

    if (immediately) {
      this.follow(FOLLOW_COEIFFICIENT, immediately);
      this.zoom(ZOOM_COEIFFICIENT, immediately);
    }
  }

  setZoom(value) {
    this.targetZoom = value;
  }

  setSyncronizes(layers) {
    this.layers = layers || [];
  }

  render() {
    this.follow(FOLLOW_COEIFFICIENT);
    this.zoom(ZOOM_COEIFFICIENT);

    if (this.stage === undefined) return;
    this.interpolation();
    this.stage.scale.x = this.currentZoom;
    this.stage.scale.y = this.currentZoom;
    this.stage.position.x = Math.round(this.position.x);
    this.stage.position.y = Math.round(this.position.y);

    for (const layer of this.layers) {
      layer.scale.x = this.currentZoom;
      layer.scale.y = this.currentZoom;
      layer.position.x = Math.round(this.position.x);
      layer.position.y = Math.round(this.position.y);
    }

    const viewportSize = { width: this.screenWidth, height: this.screenHeight };
    const viewport = {
      x: [-this.stage.position.x / this.currentZoom, -this.stage.position.x / this.currentZoom + viewportSize.width / this.currentZoom],
      y: [-this.stage.position.y / this.currentZoom, -this.stage.position.y / this.currentZoom + viewportSize.height / this.currentZoom]
    };

    if (this.lightingTexture) {
      this.lightingTexture.position.set(viewport.x[0], viewport.y[0]);
      this.lightingTexture.scale.set(1 / this.currentZoom);
    }

    Store.viewport = viewport;
  }

  interpolation() {
    const LEFT_OVER_FLOW = this.position.x >= this.boundary.x.min * this.currentZoom * -1;
    const RIGHT_OVER_FLOW = this.position.x <= (this.boundary.x.max * this.currentZoom - this.screenWidth) * -1;
    const UP_OVER_FLOW = this.position.y >= this.boundary.y.min * this.currentZoom * -1;
    const DOWN_OVER_FLOW = this.position.y <= (this.boundary.y.max * this.currentZoom - this.screenHeight) * -1;

    if (LEFT_OVER_FLOW && RIGHT_OVER_FLOW) {
      this.position.x = ((this.boundary.x.min * this.currentZoom * -1) + ((this.boundary.x.max * this.currentZoom - this.screenWidth) * -1)) / 2;
    } else if (LEFT_OVER_FLOW) {
      this.position.x = this.boundary.x.min * this.currentZoom * -1;
    } else if (RIGHT_OVER_FLOW) {
      this.position.x = (this.boundary.x.max * this.currentZoom - this.screenWidth) * -1;
    }

    if (UP_OVER_FLOW && DOWN_OVER_FLOW) {
      this.position.y = ((this.boundary.y.min * this.currentZoom * -1) + ((this.boundary.y.max * this.currentZoom - this.screenHeight) * -1)) / 2;
    } else if (UP_OVER_FLOW) {
      this.position.y = this.boundary.y.min * this.currentZoom * -1;
    } else if (DOWN_OVER_FLOW) {
      this.position.y = (this.boundary.y.max * this.currentZoom - this.screenHeight) * -1;
    }
  }

  follow(coeifficient, immediately) {
    if (this.targetObject === undefined) return;

    const targetPosition = {
      x: -this.targetObject.x * this.currentZoom + this.screenWidth / 2,
      y: -this.targetObject.y * this.currentZoom + this.screenHeight / 2
    };

    if (immediately) {
      this.position.x = targetPosition.x;
      this.position.y = targetPosition.y;
    } else {
      if (Math.abs(this.position.x - targetPosition.x) <= 1) {
        this.position.x = targetPosition.x;
      } else {
        this.position.x += (targetPosition.x - this.position.x) * coeifficient;
      }

      if (Math.abs(this.position.y - targetPosition.y) <= 1) {
        this.position.y = targetPosition.y;
      } else {
        this.position.y += (targetPosition.y - this.position.y) * coeifficient;
      }
    }
  }

  zoom(coeifficient, immediately) {
    const zoom = immediately ? this.targetZoom : this.currentZoom + (this.targetZoom - this.currentZoom) * coeifficient;
    const centerPos = {
      x: (this.position.x - this.screenWidth / 2) / this.currentZoom,
      y: (this.position.y - this.screenHeight / 2) / this.currentZoom
    };

    if (Math.abs(this.targetZoom - zoom) <= 0.001) {
      this.currentZoom = this.targetZoom <= this.boundary.zoom.max ? (this.targetZoom >= this.boundary.zoom.min ? this.targetZoom : this.boundary.zoom.min) : this.boundary.zoom.max;
    } else {
      this.currentZoom = zoom <= this.boundary.zoom.max ? (zoom >= this.boundary.zoom.min ? zoom : this.boundary.zoom.min) : this.boundary.zoom.max;
    }
    this.position.x = (centerPos.x * this.currentZoom) + this.screenWidth / 2;
    this.position.y = (centerPos.y * this.currentZoom) + this.screenHeight / 2;
  }

  destroy() {
    this.lightingTexture = undefined;
    this.targetZoom = 1;
    this.currentZoom = 1;
    this.position = { x: 0, y: 0 };
    this.boundary = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 }, zoom: { min: 0.2, max: 1 } };
    this.stage = undefined;
    this.targetObject = undefined;
    this.screenWidth = undefined;
    this.screenHeight = undefined;
    this.layers = [];

    window.removeEventListener('resize', this.resize);
  }
}
