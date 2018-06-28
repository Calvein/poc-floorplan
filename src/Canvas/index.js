import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Resizer from '../Resizer'

import './index.css'

class Canvas extends Component {
  state = {
    canvasWidth: 0,
    canvasHeight: 0,
    canvasX: 0,
    canvasY: 0,
    scale: 1,
  }

  componentDidMount() {
    this.updateCanvasPosition()
  }

  handleClickCanvas = () => {
    const { onSetSelectedElements } = this.props

    onSetSelectedElements()
  }

  makeHandleClickElement = (id) => (e) => {
    e.stopPropagation()
    this.toggleElement(id)
  }

  makeHandleChangeElement = (id) => (data) => {
    const { onChangeElement } = this.props;

    onChangeElement(id, data)
  }

  updateCanvasPosition = () => {
    const {
      width,
      height,
      x,
      y,
    } = this.props.canvasRef.current.getBoundingClientRect()

    this.setState({
      canvasWidth: width,
      canvasHeight: height,
      canvasX: x,
      canvasY: y,
    })
  }

  toggleElement = (id) => {
    const {
      selectedElements,
      onSetSelectedElements,
    } = this.props

    if (selectedElements.includes(id)) {
      return onSetSelectedElements(selectedElements.filter((selectedId) => selectedId !== id))
    }

    onSetSelectedElements([
      ...selectedElements,
      id,
    ])
  }

  handleChangeScale = (e) => {
    this.setState({
      scale: +e.target.value,
    })
  }

  render() {
    const {
      canvasRef,
      elements,
      selectedElements,
    } = this.props

    const {
      canvasWidth,
      canvasHeight,
      canvasX,
      canvasY,
      scale,
    } = this.state

    return (
      <div
        className="Canvas"
      >
        <svg
          className="Canvas-svg"
          ref={canvasRef}
          onClick={this.handleClickCanvas}
        >
          <g transform={`scale(${scale})`}>
            {elements.map((d) => (
              <g
                key={d.id}
                className={classnames(
                  { 'Canvas-element-selected': selectedElements.includes(d.id) },
                )}
                transform={`translate(${d.x} ${d.y})`}
              >
                <rect
                  className="Canvas-rect"
                  transform={`rotate(${d.deg}, ${d.width / 2}, ${d.height / 2})`}
                  width={d.width}
                  height={d.height}
                  onClick={this.makeHandleClickElement(d.id)}
                />
                <g
                  className="Canvas-text"
                  transform={`translate(${d.width / 2} ${d.height / 2})`}
                >
                  <text>
                    {d.label}
                  </text>
                  <text dy="18">
                    {d.pax}p
                  </text>
                </g>
              </g>
            ))}
          </g>
        </svg>
        <div className="Canvas-zoom">
          {scale}
          <input
            type="range"
            value={scale}
            min={0.2}
            max={1.75}
            step={0.05}
            onChange={this.handleChangeScale}
          />
        </div>
        {selectedElements.length >= 1 && selectedElements.map((id) => (
          <Resizer
            key={id}
            scale={scale}
            data={elements.find((d) => d.id === id)}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasX={canvasX}
            canvasY={canvasY}
            onDrag={this.makeHandleChangeElement(id)}
            onClick={this.makeHandleClickElement(id)}
          />
        ))}
      </div>
    )
  }
}

Canvas.propTypes = {
  canvasRef: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired,
  selectedElements: PropTypes.array.isRequired,
  onSetSelectedElements: PropTypes.func.isRequired,
  onChangeElement: PropTypes.func.isRequired,
}

export default Canvas
