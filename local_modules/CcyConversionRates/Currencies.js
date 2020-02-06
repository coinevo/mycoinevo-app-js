// Copyright (c) 2014-2019, MyCoinevo.com
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

"use strict"
//
let coinevo_config = require('../coinevo.tech_libapp_js/coinevo.tech-core-js/coinevo_utils/coinevo_config')
let coinevo_amount_format_utils = require('../coinevo.tech_libapp_js/coinevo.tech-core-js/coinevo_utils/coinevo_amount_format_utils')
const JSBigInt = require('../coinevo.tech_libapp_js/coinevo.tech-core-js/cryptonote_utils/biginteger').BigInteger
//
let ccySymbolsByCcy = exports.ccySymbolsByCcy = 
{
	EVO: "EVO", // included for completeness / convenience / API
	USD: "USD",
	AUD: "AUD",
	BRL: "BRL",
	CAD: "CAD",
	CHF: "CHF",
	CNY: "CNY",
	EUR: "EUR",
	GBP: "GBP",
	HKD: "HKD",
	INR: "INR",
	JPY: "JPY",
	KRW: "KRW",
	MXN: "MXN",
	NOK: "NOK",
	NZD: "NZD",
	SEK: "SEK",
	SGD: "SGD",
	TRY: "TRY",
	RUB: "RUB",
	ZAR: "ZAR",
}
let allOrderedCurrencySymbols = exports.allOrderedCurrencySymbols = 
[
	ccySymbolsByCcy.EVO, // included for completeness / convenience / API
	ccySymbolsByCcy.USD,
	ccySymbolsByCcy.AUD,
	ccySymbolsByCcy.BRL,
	ccySymbolsByCcy.CAD,
	ccySymbolsByCcy.CHF,
	ccySymbolsByCcy.CNY,
	ccySymbolsByCcy.EUR,
	ccySymbolsByCcy.GBP,
	ccySymbolsByCcy.HKD,
	ccySymbolsByCcy.INR,
	ccySymbolsByCcy.JPY,
	ccySymbolsByCcy.KRW,
	ccySymbolsByCcy.MXN,
	ccySymbolsByCcy.NOK,
	ccySymbolsByCcy.NZD,
	ccySymbolsByCcy.SEK,
	ccySymbolsByCcy.SGD,
	ccySymbolsByCcy.TRY,
	ccySymbolsByCcy.RUB,
	ccySymbolsByCcy.ZAR,
]
let hasAtomicUnits = exports.hasAtomicUnits = function(ccySymbol) 
{
	return (ccySymbol == ccySymbolsByCcy.EVO)
}
let unitsForDisplay = exports.unitsForDisplay = function(ccySymbol)
{
	if (ccySymbol == ccySymbolsByCcy.EVO) {
		return coinevo_config.coinUnitPlaces
	}
	return 2
}
let nonAtomicCurrency_formattedString = exports.nonAtomicCurrency_formattedString = function(
	final_amountDouble, // final as in display-units-rounded - will throw if amount has too much precision
	ccySymbol
) { // -> String
	// is nonAtomic-unit'd currency a good enough way to categorize these? 
	if (ccySymbol == ccySymbolsByCcy.EVO) {
		throw "nonAtomicCurrency_formattedString not to be called with ccySymbol=.EVO"
	}
	if (final_amountDouble == 0) {
		return "0" // not 0.0
	}
	let naiveString = `${final_amountDouble}`
	let components = naiveString.split(".")
	let components_length = components.length
	if (components_length <= 0) {
		throw "Unexpected 0 components while formatting nonatomic currency"
	}
	if (components_length == 1) { // meaning there's no '.'
		if (naiveString.indexOf(".") != -1) {
			throw "one component but no '.' character"
		}
		return naiveString+".00"
	}
	if (components_length != 2) {
		throw "expected components_length="+components_length
	}
	let component_1 = components[0]
	let component_2 = components[1]
	let component_2_str_length = component_2.length
	let currency_unitsForDisplay = unitsForDisplay(ccySymbol) 
	if (component_2_str_length > currency_unitsForDisplay) {
		throw "expected component_2_characters_count<=currency_unitsForDisplay"
	}
	let requiredNumberOfZeroes = currency_unitsForDisplay - component_2_str_length
	var rightSidePaddingZeroes = ""
	if (requiredNumberOfZeroes > 0) {
		for (var i = 0 ; i < requiredNumberOfZeroes ; i++) {
			rightSidePaddingZeroes += "0" // TODO: less verbose way to do this?
		}
	}
	return component_1+"."+component_2+rightSidePaddingZeroes // pad
}
function roundTo(num, digits) {
    return +(Math.round(num + "e+"+digits)  + "e-"+digits);
}
exports.submittableCoinevoAmountDouble_orNull = function(
	CcyConversionRates_Controller_shared,
	selectedCurrencySymbol,
	submittableAmountRawNumber_orNull // passing null causes immediate return of null
) { // -> Double?
	// conversion approximation will be performed from user input
	if (submittableAmountRawNumber_orNull == null) {
		return null
	}
	let submittableAmountRawNumber = submittableAmountRawNumber_orNull
	if (selectedCurrencySymbol == ccySymbolsByCcy.EVO) {
		return submittableAmountRawNumber // identity rate - NOTE: this is also the RAW non-truncated amount
	}
	let evoAmountDouble = rounded_ccyConversionRateCalculated_coinevoAmountNumber(
		CcyConversionRates_Controller_shared,
		submittableAmountRawNumber,
		selectedCurrencySymbol
	)
	return evoAmountDouble
}
let rounded_ccyConversionRateCalculated_coinevoAmountNumber 
	= exports.rounded_ccyConversionRateCalculated_coinevoAmountNumber 
	= function(
	CcyConversionRates_Controller_shared,
	userInputAmountJSNumber,
	selectedCurrencySymbol
) { // -> Double? // may return nil if ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
	let evoToCurrencyRate = CcyConversionRates_Controller_shared.rateFromEVO_orNullIfNotReady(
		selectedCurrencySymbol
	)
	if (evoToCurrencyRate == null) {
		return null // ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
	}
	// conversion:
	// currencyAmt = evoAmt * evoToCurrencyRate;
	// evoAmt = currencyAmt / evoToCurrencyRate.
	// I figure it's better to apply the rounding here rather than only at the display level so that what is actually sent corresponds to what the user saw, even if greater ccyConversion precision /could/ be accomplished..
	let raw_ccyConversionRateApplied_amount = userInputAmountJSNumber * (1 / evoToCurrencyRate)
	let truncated_amount = roundTo(raw_ccyConversionRateApplied_amount, 4) // must be truncated for display purposes
	if (isNaN(truncated_amount)) {
		throw "truncated_amount in rounded_ccyConversionRateCalculated_coinevoAmountNumber is NaN"
	}
	//
	return truncated_amount
}
const displayUnitsRounded_amountInCurrency = exports.displayUnitsRounded_amountInCurrency = function( // Note: __DISPLAY__ units
	CcyConversionRates_Controller_shared,
	ccySymbol,
	coinevoAmountNumber // NOTE: 'Double' JS Number, not JS BigInt
) { // -> Double?
	if (typeof coinevoAmountNumber != 'number') {
		throw 'unexpected typeof coinevoAmountNumber='+(typeof coinevoAmountNumber)
	}
	if (ccySymbol == ccySymbolsByCcy.EVO) {
		return coinevoAmountNumber // no conversion necessary
	}
	let evoToCurrencyRate = CcyConversionRates_Controller_shared.rateFromEVO_orNullIfNotReady(
		ccySymbol // toCurrency
	)
	if (evoToCurrencyRate == null) {
		return null // ccyConversion rate unavailable - consumers will try again
	}
	let currency_unitsForDisplay = unitsForDisplay(ccySymbol)
	let raw_ccyConversionRateApplied_amountNumber = coinevoAmountNumber * evoToCurrencyRate
	let truncated_amount = roundTo(raw_ccyConversionRateApplied_amountNumber, currency_unitsForDisplay) // must be truncated for display purposes
	//
	return truncated_amount
}
//
exports.displayStringComponentsFrom = function(
	CcyConversionRates_Controller_shared,
	evo_amount_JSBigInt, 
	displayCcySymbol
) {
	let EVO = ccySymbolsByCcy.EVO
	const evo_amount_str = coinevo_amount_format_utils.formatMoney(evo_amount_JSBigInt)
	if (displayCcySymbol != EVO) {
		// TODO: using doubles here is not very good, and must be replaced with JSBigInts to support small amounts
		const evo_amount_double = parseFloat(evo_amount_str)
		//
		let displayCurrencyAmountDouble_orNull = displayUnitsRounded_amountInCurrency( 
			CcyConversionRates_Controller_shared,
			displayCcySymbol,
			evo_amount_double
		)
		if (displayCurrencyAmountDouble_orNull != null) { // rate is ready
			let displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
			let displayFormattedAmount = nonAtomicCurrency_formattedString(
				displayCurrencyAmountDouble,
				displayCcySymbol
			)
			return { 
				amt_str: displayFormattedAmount, 
				ccy_str: displayCcySymbol 
			}
		} else {
			// rate is not ready, so wait for it by falling through to display EVO:
		}
	}
	return { 
		amt_str: evo_amount_str, 
		ccy_str: EVO
	} // special case
}
