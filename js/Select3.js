/**
 * jquery select3
 * 原生select转标签选择
 * @param {Object} factory
 */
(function (factory) {
	// Uses CommonJS, AMD or browser globals to create a jQuery plugin.
	// https://github.com/umdjs/umd/blob/master/templates/jqueryPlugin.js
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        factory(jQuery);
    }
}(function ($) {
	"use strict"
	
	/**
	 * 左侧label
	 * @param {Object} $nativeSelect
	 */
	function leftLabel($nativeSelect) {
		let label = $nativeSelect.attr("placeholder")
		if (!label) {
			// hide and get html
			label = $(`label[for=${$nativeSelect.attr("id")}]`).hide().html() || ""
		}
		return $.trim(label)
	}
	
	/**
	 * 右侧标签列表
	 * option ==> li>span
	 * @param {Object} $nativeSelect
	 */
	function option2li($nativeSelect) {
		let html = ""
		let selectedIndex = 0
		
		$nativeSelect.find("option").each(function(index) {
			if (!this.innerHTML) {
				return
			}
			let classList = [this.className]
			if (this.selected) {
				selectedIndex = index
				classList.push("selected")
			}
			if (this.disabled) {
				classList.push("disabled")				
			}
			
			// data-index li index
			// data-value li value
			html += `<li class="${classList.join(" ")}" data-index="${index}" data-value="${this.value}">
				<span>${this.innerHTML}</span>
			</li>`
		})
		
		return {
			index: selectedIndex,
			html: html
		}
	}
	
	/**
	 * 创建自定义select
	 * @param {Object} $nativeSelect
	 * @param {Object} classPrefix
	 * @param {Array} proxyEvents
	 */
	function createCustomSelect($nativeSelect, classPrefix, proxyEvents) {
		const $customSelect = $(`<div class="${classPrefix}s_line fix cl"></div>`)
		
		$customSelect.on("click", "li", function(event, extraParameter) {
			// TODO test disabled
			if ($nativeSelect.prop("disabled")) {
				return false
			}

			const $li = $(this)
			const dataIndex = $li.attr("data-index")
			
			// 保存为上次选中
			$($nativeSelect[0]).attr("data-lastSelectedIndex", dataIndex)
			// $nativeSelect[0].setAttribute("lastSelectedIndex", dataIndex)
			
			// 选中原生select option
			$nativeSelect.find("option").eq(dataIndex)[0].selected = true
			
			// 代理触发原生select事件
			$.each(proxyEvents, function(index, eventName) {
				$nativeSelect.trigger(eventName, [extraParameter])
			})
		})
		return $customSelect
	}

	/**
	 * 同步原生select与自定义select
	 * @param {Object} $nativeSelect
	 * @param {Object} $customSelect
	 * @param {Object} classPrefix
	 */
	function sync($nativeSelect, $customSelect, classPrefix) {
		$customSelect.html(`
			<div class="${classPrefix}sl_wrap">
				<div class="${classPrefix}sl_key">
					<span>${leftLabel($nativeSelect)}<span>
				</div>
				<div class="${classPrefix}sl_value">
					<div class="${classPrefix}sl_v_list">
						<ul class="${($nativeSelect[0].disabled ? "disabled" : "")}">
							${option2li($nativeSelect).html}
						</ul>
					</div>
				</div>
			</div>`)	
	}

	/**
	 * 防止事件重复发生,延迟触发
	 * @param {Object} func
	 * @param {Object} delay
	 */
    function preventRepeat(func, delay) {
        let timeout
        const ctx = this
        delay = parseInt(delay, 10) || 100
        
        return function() {
        	if (timeout) {
                clearTimeout(timeout)
            }
        	
        	const args = [].slice.apply(arguments)
            timeout = setTimeout(function() {
            	func.apply(ctx, args)
            }, delay)
        }
    }
    
    /**
     * 通过data缓存判断是否是select3控件
     * @param {Object} nativeSelect
     */
    function isSelect3(nativeSelect) {
    	return nativeSelect.tagName.toUpperCase() === "SELECT" &&
               $(nativeSelect).data("select3jqObj")
    }
    
    /**
     * jquery val()函数触发select3事件
     * @param {Object} $obj
     */
    function triggerJqVal($obj) {
    	for (let i = 0; i < $obj.length; i++) {
            const $select = $($obj[i])
    		
            if (!isSelect3($obj[i])) {
            	// val() 方法手动触发change事件
            	$select.trigger("change")
            	continue
            }
            

            const currentSelectedIndex = $obj[i].selectedIndex
           	const lastSelectedIndex = +$select.attr("data-lastSelectedIndex") || 0

			// fix a bug 防止select change 触发两次
			if (lastSelectedIndex != currentSelectedIndex) {
				$select.attr("data-lastSelectedIndex", currentSelectedIndex)
				$select.trigger("change").trigger("input").trigger("propertychange")
			}
        }
    }
    
    
    // !!!fixme $(select)[0].selectedIndex = N 貌似没办法处理
    
    // 重载jq val()方法，对SELECT元素的setValue特殊处理
    // val() -> 触发trigger input propertychange
    // 解决只有用户点击才会触发select的change等 事件
    const originalVal = $.fn.val
    $.fn.val = function () {
    	const ret = originalVal.apply(this, arguments)
    	if (arguments.length) {
        	triggerJqVal(this)
    	}
        return ret
    }
	
	
	$.fn.select3 = function(userConf) {
		const conf = $.extend({}, {
			prefix: "ui_",			// 样式前缀,方便订制样式
			trigger: ["change"]		// 代理原生select事件列表
		}, userConf || {})

		const selectClass = conf.prefix + "select"
		const sep = conf.prefix.replace(/[a-z]/gi, "")
		const classPrefix = selectClass + sep
		
		return this.each(function() {			
			let $customSelect
			const $nativeSelect = $(this).hide()
			const $parent = $nativeSelect.parent().hide()
			
			// 先从data缓存获取
			$customSelect = $nativeSelect.data("select3jqObj")
			if (!$customSelect) {
				$customSelect = createCustomSelect($nativeSelect, classPrefix, conf.trigger)
				// 设置缓存
				$nativeSelect.data("select3jqObj", $customSelect)
				$parent.after($customSelect)
			}

			// 监控原生select变化,同步
			$nativeSelect.on("DOMSubtreeModified", preventRepeat(function(event) {
				sync($nativeSelect, $customSelect, classPrefix)
			}))
			
			// 监控原生select change
			$nativeSelect.on("change", function(event) {
				const $customlist = $customSelect.find("li")
                $customlist.removeClass("selected")
                const selectedIndex = $nativeSelect[0].selectedIndex
				$($customlist[selectedIndex]).addClass("selected")
			})
			
			// 手动触发数据同步
			sync($nativeSelect, $customSelect, classPrefix)
		})
	}
}));