# select3

~~~html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="{CHARSET}">
		<title></title>
		<link rel="stylesheet" type="text/css" href="css/Select3_DefaultTheme.css"/>
	</head>
	<body>
		<form action="" method="post">
			
			<!--dom example-->
			<div id="">
				<label for="level1">Level1</label>
				<select name="level1" id="level1">

				</select>				
			</div>
			
			<div id="">
				<label for="level2">Level2</label>
				<select name="level2" id="level2">

				</select>				
			</div>

			<ul>
				<li>
					<input type="button" id="btn1" value="$('#level1').val()" />
					<input type="button" id="btn2" value="$('#level2').val()" />
					<span id="msg"></span>
				</li>
				<li>
					<input type="text" id="text3"/>
					<input type="button" id="btn3" value="$('#level1').val('')" />
				</li>
				<li>
					<input type="text" id="text4"/>
					<input type="button" id="btn4" value="$('#level2').val('')" />
				</li>
			</ul>			
			
		</form>

	
		<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
		<script src="js/Select3.js"></script>
		
		
		<style type="text/css">
			body {
				font-family: "微软雅黑";
			}
			ul {
				padding: 0;
				margin: 10px;
				list-style: none;
			}
			#msg {
				margin: 10px;
			}
		</style>
		
		<script type="text/javascript">
      		$(function() {
      			"use strict"
      			
      			/*
      			 * 一个简单的select联动的例子
      			 * 
      			 * 1. change事件绑定到native select控件
      			 * 2. $().val()
      			 *    $().val(val)
      			 *    直接操作原生对象
      			 * 3. 可通过配置 [trigger: [事件列表]] 添加代理事件
      			 */
      			
      			const lv1 = [ "A", "B", "C"]
      			const lv2 = [["A1", "A2", "A3"], ["B1", "B2", "B3"], ["C1", "C2", "C3"]]

				const $s1 = $("#level1")
      			const $s2 = $("#level2")
      			
      			let optionsHtml = ""
      			for(let v of lv1) {
        			optionsHtml += `<option value="${v}">${v}</option>`
      			}
      			$s1.html(optionsHtml)
      			
      			const renderLv2 = (data) => {
      				let optionsHtml = ""
      				for(let v of data) {
        				optionsHtml += `<option value="${v}">${v}</option>`
      				}
      				$s2.html(optionsHtml)
      			}
      			
      			renderLv2(lv2[0])
      			
    			$s1.on("change", function(event) {
    				renderLv2(lv2[$(this)[0].selectedIndex])
				})
    			
    			$s2.on("change", function() {
    				console.log($(this)[0].selectedIndex)
    			})
    			
    			
    			const $msg = $("#msg")
    			const $text3 = $("#text3")
    			const $text4 = $("#text4")

    			$("#btn1").on("click", function() {
    				$msg.html($s1.val())
    			})
    			
    			$("#btn2").on("click", function() {
    				$msg.html($s2.val())
    			})
    			
    			$("#btn3").on("click", function() {
    				const val = $text3.val()
    				if ($.inArray(val, lv1) === -1) {
    					$msg.html("val not exist")
    					return
    				}
    				$s1.val(val)
    			})
    			
    			$("#btn4").on("click", function() {
    				const val = $text4.val()
    				if ($.inArray(val, lv2[$s1[0].selectedIndex]) === -1) {
    					$msg.html("val not exist")
    					return
    				}
    				$s2.val(val)
    			})
    			
    			
    			
    			/*****************************************************\
    			加入以下代码即可启用即显示select3样式
    			对原有代码无入侵性
    			自动代理事件
    			\*****************************************************/
    			$s1.select3()
    			$s2.select3()
      		})
		</script>
	</body>
</html>

~~~