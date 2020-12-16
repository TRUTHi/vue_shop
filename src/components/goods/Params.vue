<template>
  <div>
    <!-- 面包屑 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 视图区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <!-- 选择 商品分类 -->
      <el-row class="selectGoodsCategory">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedCateID"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
            ref="cascaderRef"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isButtonDisabled" @click="addDialogVisible = true">
            添加参数
          </el-button>

          <!-- 表格 -->
          <el-table :data="dynamicParamsData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">

                <!-- 根据获取到的 三级 分类数据，渲染该分类下的 动态属性 标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(scope.row, i)">{{ item }}</el-tag>

                <!-- 添加 动态属性 start -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                <!-- 添加 动态属性 end -->

              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isButtonDisabled" @click="addDialogVisible = true">添加属性</el-button>

          <!-- 表格 -->
          <el-table :data="staticAttributeData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">

                <!-- 根据获取到的 三级 分类数据，渲染该分类下的 静态属性 标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(scope.row, i)">{{ item }}</el-tag>

                <!-- 添加 静态属性 start -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                <!-- 添加 静态属性 end -->

              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加属性 和 添加参数 公用的对话框 -->
      <el-dialog :title="'添加' + dialogText" :visible.sync="addDialogVisible" width="50%" @close="addDialogVisibleClosed">
        <!-- 表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addFormConfirm">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑 动态参数|静态属性 的公用对话框 -->
      <el-dialog :title="'修改' + dialogText" :visible.sync="editDialogVisible" width="50%" @close="editDialogVisibleClosed">
        <!-- 表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editFormConfirm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类 信息
      cateList: [],
      // 已选择的 商品分类 id
      selectedCateID: [],
      // 级联选择器 配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 激活的 标签页
      activeName: 'many',
      // 静态属性 数据
      staticAttributeData: [],
      // 动态参数 数据
      dynamicParamsData: [],
      // 对话框
      addDialogVisible: false,
      // 添加 静态属性|动态参数 表单
      addForm: {
        attr_name: ''
      },
      // 添加 静态属性|动态参数 表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 编辑 静态属性|动态参数 对话框的 显示|隐藏
      editDialogVisible: false,
      // 编辑 静态属性|动态参数 表单
      editForm: {},
      // 编辑 静态属性|动态参数 表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取 商品分类 信息
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error('商品分类，获取失败了！')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器 当选择项变化时
    handleChange() {
      // console.log(this.selectedCateID)
      this.getParamsList()
    },
    // 标签页 切换时
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsList()
    },
    // 获取 参数列表
    async getParamsList() {
      // 选择的是否为 第三级 分类
      if (this.selectedCateID.length != 3) {
        // 否
        this.selectedCateID = []
        this.staticAttributeData = []
        this.dynamicParamsData = []
        return false
      }
      // 是
      const { data: res } = await this.$axios.get(
        'categories/' + this.categoryID + '/attributes',
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('参数数据，获取失败了！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName == 'many') {
        // 说明 获取的是 动态参数
        this.dynamicParamsData = res.data
      } else {
        // 说明 获取的是 静态属性
        this.staticAttributeData = res.data
      }
    },
    // 当对话框，关闭后
    addDialogVisibleClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 当点击对话框的 "确认" 按钮
    addFormConfirm() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('categories/' + this.categoryID + '/attributes', {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status != 201) {
          return this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 当 动态参数|静态属性 对话框，关闭时
    editDialogVisibleClosed() {
      this.$refs.editFormRef.resetFields() // 重置表单
    },
    // 当点击 编辑 动态参数|静态属性 对话框的 "确定" 按钮
    editFormConfirm() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.put(`categories/${this.categoryID}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status != 200) return this.$message.error('修改失败！')
        this.$message.success('修改成功！')
        this.getParamsList()
        this.editDialogVisible = false
      })
      this.editDialogVisible = false
    },
    // 显示 编辑 动态参数|静态属性 对话框
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get(`categories/${this.categoryID}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status != 200) { return this.$message.error('获取失败！') }
      this.editForm = res.data
      console.log(res.data)
      this.editDialogVisible = true
    },
    // 删除 动态参数|静态属性
    async removeDialog(id) {
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result != 'confirm') { return this.$message.info('已取消，删除操作！') }
      const { data: res } = await this.$axios.delete(`categories/${this.categoryID}/attributes/${id}`)
      if (res.meta.status != 200) { return this.$message.error('删除操作，失败了！') }
      this.getParamsList()
      this.$message.success('删除操作，成功了！')
    },
    // 事件处理函数 —— 失去焦点|抬起回车键  (添加 动态参数 输入框)
    handleInputConfirm(row) {
      // 输入的是否为 空 字符串
      if (row.inputValue.trim().length == 0) {
        // 为空
        row.inputValue = ''
        row.inputVisible = false
        return false
      } // 不为空
      row.attr_vals.push(row.inputValue) // 前端渲染
      row.inputValue = '' // 清空 输入框
      row.inputVisible = false
      // 同步到后台数据库中
      this.updateAttr(row)
    },
    // 显示，输入框
    showInput(row) {
      row.inputVisible = true
      // DOM 没更新
      this.$nextTick(() => {
        // DOM 更新了
        this.$refs.saveTagInput.$refs.input.focus() // 获取焦点
      })
    },
    // 事件处理函数 —— tag 标签关闭时
    handleClosed(row, i) {
      row.attr_vals.splice(i, 1)
      // 同步到后台数据库中
      this.updateAttr(row)
    },
    // 更新操作 ———— 动态参数
    async updateAttr(row) {
      const { data: res } = await this.$axios.put(`categories/${this.categoryID}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status != 200) { return this.$message.error('修改失败了！') }
      this.$message.success('修改成功了！')
    }
  },
  computed: {
    // 添加参数｜添加属性 按钮的是否禁用
    isButtonDisabled() {
      if (this.selectedCateID.length == 3) {
        return false
      } else {
        return true
      }
    },
    // 当前选择的 三级 分类 ID
    categoryID() {
      if (this.selectedCateID.length == 3) {
        return this.selectedCateID[2]
      } else {
        return null
      }
    },
    // 对话框 文本处理
    dialogText() {
      if (this.activeName == 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  watch: {
    selectedCateID() {
      if (this.$refs.cascaderRef) {
        this.$refs.cascaderRef.dropDownVisible = false // 监听，值发生变化 就关闭它
      }
    }
  },
  created() {
    this.getCateList()
  },
  mounted() {
    setInterval(function () {
      document
        .getElementsByClassName('el-cascader-node__label')
        .forEach((item) => {
          item.onclick = function () {
            if (this.previousElementSibling) this.previousElementSibling.click()
          }
        })
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.selectGoodsCategory {
  margin: 15px 0;
}

.el-tag, .button-new-tag {
  margin: 10px;
}

.input-new-tag {
  margin: 10px;
  width: 150px;
}
</style>
