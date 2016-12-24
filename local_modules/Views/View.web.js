// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const EventEmitter = require('events')
//
const web_debug_utils = require('./web_debug_utils')	
//
class View extends EventEmitter
{
	//
	//
	// Setup
	//
	constructor(options, context)
	{
		super() // must call before can access `this`
		//
		const self = this
		{
			self.options = options
			self.context = context
		}
		{
			const options_tag = options.tag
			if (typeof options_tag === 'string' && options_tag !== null && options_tag.length > 0) {
				self.tag = options_tag
			} else {
				self.tag = "div"
			}
		}
		{ // proceed to setup for runtime:
			self.__View_setup_views() // namespacing to avoid subclass collision
		}
	}
	__View_setup_views()
	{
		const self = this
		self.subviews = []
		self.setup_loadView()
	}
	//
	//
	// Setup - Imperatives - Overridable
	//
	setup_loadView()
	{
		const self = this
		const tagName = self.TagName()
		self.layer = document.createElement(tagName)
	}
	//
	//
	// Setup - Accessors - Overridable
	//
	TagName()
	{
		const self = this
		return self.tag // div is the default; you can either override this method to return what you'd like or pass "tag" in options
	}
	//
	//
	// Runtime - Accessors
	//
	HasASuperview()
	{
		const self = this
		const hasASuperview = typeof self.superview !== "undefined" && self.superview !== null
		//
		return hasASuperview ? true : false
	}
	//
	//
	// Runtime - Imperatives - View hierarchy
	//
	addSubview(view)
	{
		const self = this
		const toLayer = self.layer
		self.addSubview_appendingToLayer(view, toLayer)
	}
	addSubview_appendingToLayer(view, superlayer)
	{ // this is exposed so you can inject subviews into manually created children elements of your choice
		const self = this
		//
		self.viewWillAppear()
		{
			// local state:
			self.subviews.push(view)
			// subview's dependency setup:
			view.superview = self
			view.superlayer = superlayer
			// DOM:
			superlayer.appendChild(view.layer)
		}
		self.viewDidAppear()
	}
	removeFromSuperview()
	{ // throws
		const self = this
		if (typeof self.superview === 'undefined' || self.superview === null) {
			throw "no superview"
			return
		}
		if (typeof self.superlayer === 'undefined' || self.superlayer === null) {
			throw "no superlayer"
			return
		}
		//
		self.viewWillDisappear()
		{
			// DOM:
			self.superlayer.removeChild(self.layer)
			// now we can release the superlayer
			self.superlayer = null
			// now before we can release the superview,
			// we must manage the superview's subview list
			const superview_indexOf_self = self.superview.subviews.indexOf(self)
			if (superview_indexOf_self === -1) {
				throw "superview didn't have self as subview"
			}
			self.superview.subviews.splice(superview_indexOf_self, 1)
			// and now we can free the superview
			self.superview = null
		}
		self.viewDidDisappear()
	}
	removeAllSubviews()
	{
		const self = this
		self.subviews.forEach(
			function(view, i)
			{
				view.removeFromSuperview()
			}
		)
		self.subviews = []
	}
	//
	//
	// Runtime - Imperatives - Debug
	//
	DEBUG_BorderSubviews()
	{
		const self = this
		web_debug_utils.DEBUG_BorderSubviews(self)
	}
	//
	//
	// Runtime - Delegation - View visibility - Overridable - Be sure to call on super
	//
	viewWillAppear()
	{
	}
	viewDidAppear()
	{
	}
	viewWillDisappear()
	{		
	}
	viewDidDisappear()
	{		
	}	
}
module.exports = View