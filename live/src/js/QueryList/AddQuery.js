/* global feed, $ */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Radio, OverlayTrigger, Tooltip } from 'react-bootstrap';

var Utils = require('../helper/utils.js');

class AddQuery extends React.Component {
	state = {
		showModal: false,
		validate: {
			touch: false,
			name: false,
			type: false,
			body: false
		},
		name: this.props.editable ? this.props.queryInfo.name : '',
		operation: (this.props.queryInfo && this.props.queryInfo.operation) || 'view'
	};

	componentDidUpdate() {
		Utils.applySelect.call(this);
	}

	applySelect = (ele) => {
		var $this = this;
		var $eventSelect = $("." + this.props.selectClass);
		var typeList = this.getType();
		$eventSelect.select2({
			tags: true,
			data: typeList
		});
		$eventSelect.on("change", function(e) {
			var validateClass = $this.state.validate;
			validateClass.type = true;
			$this.setState({
				validate: validateClass
			});
		});
	};

	getType = () => {
		const allTypes = this.props.editable ?
			[...new Set(this.props.types.concat(this.props.queryInfo.type))] :
			this.props.types;
		const typeList = allTypes.map(function(type) {
			return {
				id: type,
				text: type
			};
		});
		return typeList;
	};

	handleChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	}

	handleOperation = (operation) => {
		this.setState({
			operation
		});
	}

	close = () => {
		this.setState({
			error: null
		});
		Utils.closeModal.call(this);
	};

	open = () => {
		Utils.openModal.call(this);
		setTimeout(() => {
			if (this.props.editable) {
				$('#applyQueryOn').val(this.props.queryInfo.type).change();
			}
		}, 300);
	};

	validateInput = () => {
		var validateClass = this.state.validate;
		var queryValues = {
			name: document.getElementById('setName').value,
			query: this.editorref.getValue(),
			createdAt: new Date().getTime(),
			type: document.getElementById('applyQueryOn').value || [],
			operation: this.state.operation
		};
		validateClass.touch = true;
		validateClass.name = queryValues.name === '' ? false : true;
		validateClass.body = this.IsJsonString(queryValues.query);
		this.setState({
			validate: validateClass
		});
		if (validateClass.name && validateClass.body) {
			this.validateQuery(queryValues);
		}
	};

	validateQuery = (queryValues) => {
		$('.applyQueryBtn').addClass('loading');
		$('.applyQueryBtn').attr('disabled', true);
		var self = this;
		if (!queryValues.operation || queryValues.operation === 'view') {
			feed.testQuery(queryValues.type, JSON.parse(queryValues.query))
			.then(function(res) {
				if (!res.hasOwnProperty('error')) {
					$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
					self.props.includeQuery(queryValues, self.props.queryIndex);
					self.close();
				} else {
					$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
					self.setState({
						error: res.error
					});
				}
			}).catch(function(err) {
				self.setState({
					error: err
				});
				$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
			});
		} else {
			if (queryValues.operation === 'update') {
				console.log("queryValues: ", queryValues)
				const queryResult = feed.testUpdateQuery(
					queryValues.type, JSON.parse(queryValues.query)
				);
				queryResult
					.then((res) => {
						$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
						self.props.includeQuery(queryValues, self.props.queryIndex);
						self.close();
						toastr.success(res.updated + ' records updated');
					})
					.fail((err) => {
						self.setState({
							error: err
						});
						$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
					});
			} else if (queryValues.operation === 'delete') {
				const queryResult = feed.testDeleteQuery(
					queryValues.type, JSON.parse(queryValues.query)
				);
				queryResult
					.then((res) => {
						console.log(res)
						$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
						self.props.includeQuery(queryValues, self.props.queryIndex);
						self.close();
						toastr.success(res.deleted + ' records deleted');
					})
					.fail((err) => {
						self.setState({
							error: err
						});
						$('.applyQueryBtn').removeClass('loading').removeAttr('disabled');
					});
			}
		}
	};

	IsJsonString = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	userTouch = (flag) => {
		// this.props.userTouchAdd(flag);
	};

	hideError = () => {
		this.setState({
			error: null
		});
	};

	isErrorExists = () => {
		var errorText;
		if(this.state.error) {
			var error = this.state.error;
			try {
				error = JSON.stringify(this.state.error);
			} catch(e) {}
			errorText = (
				<div key={Math.random()} className="query-error alert alert-danger alert-dismissible" role="alert">
					<button type="button" className="close" onClick={this.hideError}><span aria-hidden="true">&times;</span></button>
					{error}
				</div>
			);
		}
		return errorText;
	};

	render() {
		var typeList = '';
		var btnText = this.props.text ? this.props.text : '';
		if (typeof this.props.types != 'undefined') {
			typeList = this.props.types.map(function(type) {
				return <option value={type}>{type}</option>
			});
		}
		if (this.state.validate.touch) {
			var validateClass = {};
			validateClass.body = this.state.validate.body ? 'form-group' : 'form-group has-error';
			validateClass.name = this.state.validate.name ? 'form-group' : 'form-group has-error';
			validateClass.type = this.state.validate.type ? 'form-group' : 'form-group has-error';
		} else {
			var validateClass = {
				name: 'form-group',
				body: 'form-group',
				type: 'form-group'
			};
		}
		var selectClass = this.props.selectClass + ' tags-select form-control';

		return (
			<div className={`add-record-container ${this.props.editable ? 'edit-query-container col-xs-5' : 'col-xs-12'} pd-0`}>
				<a href="javascript:void(0);" className="add-record-btn btn btn-primary col-xs-12" title={this.props.editable ? 'Edit' : 'Add'} onClick={this.open} >
					{
						this.props.editable ?
							<span>Edit</span> :
							<span><i className="fa fa-plus pad-right" />Add Query</span>
					}
				</a>
				<Modal show={this.state.showModal} onHide={this.close}>
					<Modal.Header closeButton>
						<Modal.Title>
							{
								this.props.editable ?
									'Update' :
									'Add'
							}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form className="form-horizontal" id="addObjectForm">
							<div className={validateClass.name}>
								<label htmlFor="inputEmail3" className="col-sm-3 control-label">Query Name</label>
								<div className="col-sm-9">
									<input type="text" className="form-control" id="setName" placeholder="A unique name to save this query by .." name="name" value={this.state.name} onChange={this.handleChange} />
									<span className="help-block">
										Query Name is required.
									</span>
								</div>
							</div>
							{Utils.getTypeMarkup('query', validateClass, selectClass)}
							<div className="form-group">
								<label htmlFor="operation" className="col-sm-3 control-label">Operation</label>
								<div className="col-sm-9">
									<Radio name="operation" onChange={() => this.handleOperation('view')} checked={this.state.operation === 'view'} inline>
										View Data&nbsp;
										<OverlayTrigger
											placement="top"
											overlay={<Tooltip id="tooltip-explaination">View data that matches the below query clause.</Tooltip>}
										>
											<i className="fa fa-info-circle" />
										</OverlayTrigger>
									</Radio>{' '}
									<Radio name="operation" onChange={() => this.handleOperation('update')} checked={this.state.operation === 'update'} inline>
										Update by Query&nbsp;
										<OverlayTrigger
											placement="top"
											overlay={<Tooltip id="tooltip-explaination">Update data that matches the below query clause. Updates are permanent, use with care. </Tooltip>}
										>
											<i className="fa fa-info-circle" />
										</OverlayTrigger>
									</Radio>{' '}
									<Radio name="operation" onChange={() => this.handleOperation('delete')} checked={this.state.operation === 'delete'} inline>
										Delete by Query&nbsp;
										<OverlayTrigger
											placement="top"
											overlay={<Tooltip id="tooltip-explaination">Delete data that matches the below query clause. Deletes are permanent, use with care. </Tooltip>}
										>
											<i className="fa fa-info-circle" />
										</OverlayTrigger>
									</Radio>
								</div>
							</div>
							{
								this.props.editable ?
									Utils.getBodyMarkup('query', validateClass, selectClass, this.userTouch, this.props.queryInfo.query) :
									Utils.getBodyMarkup('query', validateClass, selectClass, this.userTouch)
							}
						</form>
					</Modal.Body>
					<Modal.Footer>
						<div>
							{this.isErrorExists()}
						</div>
						<Button key="applyQueryBtn" className="applyQueryBtn" bsStyle="success" onClick={this.validateInput}>
							<i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
							Apply Query
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

AddQuery.defaultProps = {
	queryIndex: null
};

AddQuery.propTypes = {
	editable: PropTypes.bool,
	queryInfo: PropTypes.object	// eslint-disable-line
};

module.exports = AddQuery;
