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
const View = require('../Views/View.web')
//
class TabBarItemButtonView extends View
{
	constructor(options, context)
	{
		options.tag = "a"
		//
		super(options, context)
		const self = this
		{
			self.side_px = options.side_px || 44
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		{
			const layer = self.layer
			layer.style.display = "inline-block"
			layer.style.position = "relative"
			layer.style.webkitAppRegion = "no-drag" // make clickable
			layer.style.width = `${self.side_px}px`
			layer.style.height = `${self.side_px}px`
		}
		{ // icon
			const layer = document.createElement("img")
			{
				layer.style.webkitAppRegion = "no-drag" // make clickable
				layer.style.width = `100%`
				layer.style.height = `100%`
			}
			self.iconImageLayer = layer
			self.layer.appendChild(self.iconImageLayer)
		}
		{ // observation
			self.layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self.emit(self.EventName_clicked(), self)
					}
					return false
				}
			)
		}
	}
	//
	//
	// Runtime - Accessors - Events
	//
	EventName_clicked()
	{
		return "EventName_clicked"
	}
	//
	//
	// Runtime - Accessors - Selection
	//
	IsSelected()
	{
		const self = this
		return self.isSelected === true
	}
	//
	//
	// Runtime - Imperatives - Selection
	//
	Select()
	{
		const self = this
		self.isSelected = true
		//
		self.iconImageLayer.style.backgroundColor = "blue"
	}
	Deselect()
	{
		const self = this
		self.isSelected = false
		//
		self.iconImageLayer.style.backgroundColor = "transparent"
	}	
}
module.exports = TabBarItemButtonView