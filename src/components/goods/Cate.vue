<template>
  <div>
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 视图区域 卡片 -->
    <el-card>
      <!-- 添加分类 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: green;" v-if="scope.row.cat_deleted == false"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag size="mini" v-if="scope.row.cat_level == 1" type="success">二级</el-tag>
          <el-tag size="mini" v-if="scope.row.cat_level == 2" type="danger">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类 对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" @close="addCateDialogClosed" width="50%">
      <!-- 添加分类 表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="cascaderValueChange"
            clearable
            ref="cascaderRef"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类 对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <!-- 表单 -->
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除分类 提示框 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询 商品分类 条件
      queryInfo: {
        type: 3,
        pagenum: 1, // 当前页
        pagesize: 5 // 每页条数
      },
      // 商品分类 数据
      cateList: [],
      // 商品分类 数据 总条数
      total: 0,
      // 表格 各列的 配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 将当前列设置为 自定义模版列
          template: 'isok' // 对应的 作用域插槽 名称
        },
        {
          label: '排序',
          type: 'template', // 将当前列设置为 自定义模版列
          template: 'sort' // 对应的 作用域插槽 名称
        },
        {
          label: '操作',
          type: 'template', // 将当前列设置为 自定义模版列
          template: 'operation' // 对应的 作用域插槽 名称
        }
      ],
      // 控制 添加分类对话框的 显示与隐藏
      addCateDialogVisible: false,
      // 添加分类 表单 对象
      addCateForm: {
        cat_pid: 0, // 分类父 id，默认为 1 级分类
        cat_name: '',
        cat_level: 0 // 分类层级，默认为 1 级分类
      },
      // 添加分类 表单 验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类 数据
      parentCateList: [],
      // 级联选择器 选中项的 id 数组
      selectedKeys: [],
      // 级联选择器 Props 属性的 配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 修改分类 对话框
      editCateDialogVisible: false,
      // 修改分类 表单
      editCateForm: {},
      // 修改分类 表单 验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取 商品分类 数据列表
    async getCateList() {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
      if (res.meta.status != 200) return this.$message.error('商品分类，获取失败！')
      // 存储 数据
      this.cateList = res.data.result
      // 存储 数据 总条数
      this.total = res.data.total
    },
    // 分页 当每页显示的条数 发生变化时
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize // 更新 查询条件
      this.getCateList() // 更新 数据
    },
    // 分页 当页数 发生变化时
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage // 更新 查询条件
      this.getCateList() // 更新 数据
    },
    // 显示 添加分类 对话框
    showAddCateDialog() {
      this.getParentCateList() // 获取 父级分类 数据列表
      this.addCateDialogVisible = true
    },
    // 获取 父级分类 数据列表
    async getParentCateList() {
      const { data: res } = await this.$axios.get('categories', { params: { type: 2 } })
      if (res.meta.status != 200) return this.$message.error('获取父级分类，失败了！')
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 级联选择器 当选择项 发生变化时
    cascaderValueChange() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) { // 用户选择了 2 或 3 级分类
        // 父级分类的 id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的 level
        this.addCateForm.cat_level = this.selectedKeys.length
        return false
      } else { // 用户选择了 1 级分类
        // 父级分类的 id
        this.addCateForm.cat_pid = 0
        // 当前分类的 level
        this.addCateForm.cat_level = 0
      }
    },
    // 添加 分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('categories', this.addCateForm)
        if (res.meta.status != 201) return this.$message.error('添加分类，失败了！')
        this.$message.success('添加分类，成功了！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭 当添加分类对话框 关闭时
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 显示 修改分类 对话框
    async showEditCateDialog(id) {
      const { data: res } = await this.$axios.get('categories/' + id)
      if (res.meta.status != 200) return this.$message.error('查询分类信息，失败了！')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 修改 分类
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status != 200) return this.$message.error('修改分类信息，失败了！')
        this.$message.success('修改分类信息，成功了！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    }
  },
  watch: {
    selectedKeys() {
      if (this.$refs.cascaderRef) {
        this.$refs.cascaderRef.dropDownVisible = false // 监听，值发生变化 就关闭它
      }
    }
  },
  created() {
    // 获取 商品分类 数据
    this.getCateList()
  },
  mounted () {
    setInterval(function () {
      document.querySelectorAll('.el-cascader-node__label').forEach(el => {
        el.onclick = function () {
          if (this.previousElementSibling) this.previousElementSibling.click()
        }
      })
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
