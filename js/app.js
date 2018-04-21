;((Vue) => {
	let todos = [
		{id:1,
		title:'吃饭',
		completed:false
		},
		{id:1,
			title:'吃饭',
			completed:true
		},
		{id:1,
			title:'吃饭',
			completed:false
		}
	]

	//全局 自定义指令 'v-focus',内部实现dom操作
	Vue.directive('focus',{
		inserted: function (el) {
			//聚焦元素 el 就是v-focus绑定的dom对象
			el.focus()
		}
	})

	 window.app = new Vue({
		el: '#vueapp',
		data:{
			title: 'TdoList',
			todos: JSON.parse(window.localStorage.getItem('todos')||'[]') , //如果键值对名称一样，可以简写成 todos
			//这里不要使用this，因为this指向的是window
			//所以这里无法实现你想要的结果
			//leftCount:this.todos.filter(item=>!item.completed).length
			currentEditing:null,
			filterStat: 'all',
			// toggleAllStat:false
		},
		computed:{
			//该属性比较特殊，从代码来看是一个方法,但是只能当做属性来用
			//计算属性：多次使用时只会调用一次，比直接调用方法效率更高
			//计算属性和方法：
			//都可以达到同样的效果
			//-方法没有缓冲，视图一旦发生改变，方法就会执行
			//-计算属性是真正的依赖内部data中的数据，如果数据没有发生改变，视图不会重新渲染
			//计算属性依赖数据进行缓存
			leftCount:function () {
				return this.todos.filter(item=>!item.completed).length
			},
			//点击状态的计算属性
			filterTodos:function () {
				//all
				//active
				//completed
				switch (this.filterStat){
					case 'active':
						console.log(11)
						return this.todos.filter(item=>!item.completed)
						break
					case 'completed':
						return this.todos.filter(item=>item.completed)
						break
					default:
						return this.todos
						break

				}
			},
			//处理全选的联动效果
			toggleAllComputed:{
				get() {

				return this.todos.every(item=>item.completed)
			},
				set(){
					console.log('计算属性set方法被执行了')
				}
			}
		},

		 /*
         * @Author: KDF
         * @Date:   2018-01-01
         * 计算属性确实具有watch的功能，但是计算属性一般用于需要返回数据的功能
         * 而watch则踊跃定义你的业务功能，他不是让你去模本中绑定的
         * 而是存粹的让你监视这个成员的改变，从而加入一些自定义的的业务功能
         */
		 //默认只监视一层
		 //如果需要深度监视 需要配置 deep:true
		 watch: {
			todos:{
				handler:function (val,oldVal) {
					//执行语句
					window.localStorage.setItem('todos',JSON.stringify(val))
				},
				deep:true
			}
		 },

		methods: {
			//es6 对象属性函数简写
			//等价于addTodo:function(){}
			//它没有特殊的特定，仅仅为了方便
			addTodo (event){
			// console.log(event.target.value)
				let todoText = event.target.value.trim()
				if (!todoText){
					return
				}
				var lastTodo = this.todos[this.todos.length-1]

				var id = lastTodo ? lastTodo.id + 1 : 1
			this.todos.push({
				id,
				title:todoText,
				completed:false
				})
				//把todos持久化
				// window.localStorage.setItem('todos',JSON.stringify(this.todos))
			event.target.value = ''
			},

			toggleAll (event) {
				var checked = event.target.checked
				//遍历数组中的所有元素，把每个completed都设置成checked
				//由于使用v-model，会及时更改状态
				this.todos.forEach((todo) => todo.completed=checked)
				// console.log(event.target.checked)
			},

			removeTodo(delIndex,$event){
				this.todos.splice(delIndex,1)
				console.log($event)
				// window.localStorage.setItem('todos',JSON.stringify(this.todos))
			},

			//删除已经完成的任务项
			removeAllDone(){
				//找到所有已完成的任务项，把其删除
				// this.todos.forEach((item,index)=>{
				// 	if(item.completed){
				// 		//已完成
				// 		console.log(item.title)
				// 	}
				// })
				//数组过滤函数filter,把所有需要的数据过滤出来，然后重新赋值给todos
				this.todos = this.todos.filter((item,index)=> !item.completed
				)

				//在遍历的过程中删除完成项
				/*for (var i=0;i<this.todos.length;i++) {
					if(this.todos[i].completed){
						this.todos.splice(i,1)
						i--
					}
				}*/
			},

			//如果多处使用，会重复执行，效率较低
			//方法也可以用于模板绑定
			//在模板中调用方法，返回值将被渲染
			getLeftCount(){
				return this.todos.filter(item=>!item.completed).length
			},

			//保存编辑项
			saveEdit(item,index,event){
				//1.拿到文本框中的数据
				//若果为空 直接删除数据
				//如果不为空 则修改数据
				//2.将数据方法任务项中
				//3.去吃editing
				var editText = event.target.value.trim()
				//简写
				!editText.length ? this.todos.splice(index,1):item.title=editText
				if(!editText.length){
					return this.todos.splice(index,1)
				}
				//2
				 item.title = editText
				//3
				this.currentEditing = null
			},

			//切换状态
			// toggle(){
			// 	//every 每一个都选中时 返回true
			// 	//some
			// 	//生命周期，模板更新的问题
			// 	Vue.nextTick(()=>{
			// 		console.log(this.todos.every(item=>item.completed))
			// 		this.toggleAllStat = this.todos.every(item => item.completed)
			// 	})
            //
			// },

		},

		 //配置局部 自定义指令
		 directives:{
			//第一个指令
			editingFocus: {
				//钩子函数
				bind (el) {

				},
				inserted (el) {

				},
				//在指令钩子中，函数内部的this是window
				update (el,binding) {
					console.log(el)
					/*if(binding.value.item === binding.value.currentEditing){
						el.parentElement.parentElement.getElementsByClassName('edit')[0].focus()
					}*/
					if (binding.value){
						el.focus()
					}
				},

			componentUpdated () {

			},

			},
			//第二个指令
		 }
	})

	window.onhashchange = function () {
		var hash = window.location.hash.substr(2)||'all'

		//设置到程序中的过滤状态
		//  过滤状态一旦改变，则计算属性会感知到这个filterStat变了
		//  当它感知到filterStat变了之后，计算属性的方法就会重新计算
		window.app.filterStat = hash
	}

})(Vue);

/*1编程方式:MVVM 数据驱动
* 2 el挂在元素 不能挂在在HTML和body元素上
* 3 data普通数据
* 4 methods methods方法名不能和data中的成员重名
* 5 computed计算属性 会缓存结果，不能当做方法来访问 基于Object.definePropety这个api来实现
* 6自定义指令（操作DOM)
* 7 基本指令{{}} v-if v-show v-for v-on($event传递事件) v-bind v-model
*
**/
