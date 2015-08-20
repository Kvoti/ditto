import React from 'react';

const baseStyle = {
  padding: '0 0 0 5px',
  marginBottom: 5
};

const draggableStyle = {
  backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)',
  backgroundPosition: 'left center',
  backgroundRepeat: 'repeat-y',
  paddingLeft: 10,
  // TODO how to add cursor: 'grab' here?
  cursor: '-webkit-grab'
};

export default class Row extends React.Component {
  render() {
    let { children, ...props } = this.props;
    let style = {...baseStyle};
    if (this.props.draggable) {
      style = {...style, ...draggableStyle};
    }
    return (
      <div style={style}
              {...props}
              >
        {children}
      </div>
    );
  }
}
