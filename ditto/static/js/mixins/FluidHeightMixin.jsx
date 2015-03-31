var FluidHeightMixin = {

    componentWillMount: function () {
	this._updateHeight();
    },
    
    componentDidMount: function() {
	$(window).on('resize', this._updateHeight);
    },

    componentWillUnmount: function() {
	$(window).off('resize', this._updateHeight);
    },

    _updateHeight: function () {
	var height = $(window).height() - this.props.heightOffset;
	this.setState({height: height});
    },

}    

module.exports = FluidHeightMixin;
