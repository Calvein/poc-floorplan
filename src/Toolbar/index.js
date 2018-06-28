import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './index.css'

class Toolbar extends Component {
  render() {
    const {
      hasElementsSelected,
      onAddElement,
      onDuplicateElements,
    } = this.props

    return (
      <div className="Toolbar">
        <button onClick={onAddElement}>
          Add rect
        </button>
        <button
          disabled={!hasElementsSelected}
          onClick={onDuplicateElements}
        >
          Duplicate
        </button>
      </div>
    )
  }
}

Toolbar.propTypes = {
  hasElementsSelected: PropTypes.bool.isRequired,
  onAddElement: PropTypes.func.isRequired,
  onDuplicateElements: PropTypes.func.isRequired,
}

export default Toolbar
