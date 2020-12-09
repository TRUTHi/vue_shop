<template>
  <div>
    <!-- 面包屑 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>首页管理</el-breadcrumb-item>
      <el-breadcrumb-item>首页列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 视图区域 -->
    <el-card>
      <!-- 第 1 行 -->
      <el-row :gutter="20">
        <!-- 第 1 列：搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList('yes')"></el-button>
          </el-input>
        </el-col>
        <!-- 第 2 列：添加区域 -->
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 表格 用户列表区域 -->
    <el-table :data="userList" stripe border>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <!-- 编辑 -->
          <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除 -->
          <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <!-- 角色分配 -->
          <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
            <el-button icon="el-icon-star-off" type="warning" size="mini" @click="showAllotRoleDialog(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 对话框 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 主体 内容 -->
      <el-form :model="addForm" status-icon :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 对话框 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 主体 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 对话框 角色分配 -->
    <el-dialog title="角色分配" :visible.sync="allotRoleDialog" width="50%" @close="closedAllotRoleDialog">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配的角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证 邮箱
    var checkEmail = (rule, value, callback) => {
      var regEmail = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
      if (regEmail.test(value)) return callback()
      return callback(new Error('请输入合法的邮箱地址'))
    }
    // 验证 手机
    var checkMobile = (rule, value, callback) => {
      var regMobile = /^1[345789]\d{9}$/
      if (regMobile.test(value)) return callback()
      return callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 请求 用户列表 对象
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页
        pagesize: 2 // 每页几条
      },
      userList: [],
      total: 0,
      // 控制 添加用户对话框的 显示与隐藏
      addDialogVisible: false,
      // 控制 修改用户对话框的 显示与隐藏
      editDialogVisible: false,
      // 添加用户 表单 数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户 表单 验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户 表单 数据
      editForm: {},
      // 修改用户 表单 验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //  角色分配 对话框
      allotRoleDialog: false,
      //  角色分配 当前用户信息
      userInfo: {},
      //  角色分配 角色列表信息
      rolesList: [],
      //  角色分配 选中的角色 id
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取 用户列表 数据
    async getUserList(str) {
      // 是否点击的是 搜索 查询
      if (str == 'yes') this.queryInfo.pagenum = 1

      const { data: res } = await this.$axios.get('users', { params: this.queryInfo })
      if (res.meta.status != 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 事件 每页几条
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 事件 当前页
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 事件 当用户状态发生改变
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 事件 当添加用户对话框 关闭时
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 事件 当添加用户对话框 点击确定按钮时
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 成功
        const { data: res } = await this.$axios.post('users', this.addForm)
        if (res.meta.status != 201) return this.$message.error('添加用户失败！')
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 显示 修改用户 对话框
    async showEditDialog(id) {
      // 根据 id 查询用户信息
      const { data: res } = await this.$axios.get('users/' + id)
      if (res.meta.status != 200) return this.$message.error('查询用户信息失败！') // 失败
      // 成功
      // console.log(res.data)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户对话框 关闭时 触发
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户对话框 点击确定时 触发
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return // 验证未通过
        // 验证通过
        const { data: res } = await this.$axios.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status != 200) return this.$message.error('修改失败！')
        this.editDialogVisible = false
        this.getUserList()
        this.$message.error('修改成功！')
      })
    },
    // 根据 id 删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult != 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status != 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功！')
      this.getUserList()
    },
    //  显示 分配角色 对话框
    async showAllotRoleDialog(userInfo) {
      this.userInfo = userInfo // 保存 当前分配角色的用户信息
      const { data: res } = await this.$axios.get('roles') // 获取 角色列表
      if (res.meta.status != 200) return this.$message.error('获取角色列表，失败了！')
      this.rolesList = res.data
      // console.log(this.rolesList)
      this.allotRoleDialog = true
    },
    //  设置 为用户分配新角色
    async setUserRole() {
      const { data: res } = await this.$axios.put('users/' + this.userInfo.id + '/role', {
        rid: this.selectedRoleId
      })
      if (res.meta.status != 200) return this.$message.error('分配角色，失败了！')
      this.$message.success('分配角色，成功了！')
      this.getUserList()
      this.allotRoleDialog = false
    },
    //  事件 当分配角色对话框，关闭时
    closedAllotRoleDialog() {
      this.selectedRoleId = '' // 重置
      this.userInfo = {} // 重置
    }
  },
  created() {
    this.getUserList()
  }
}
</script>
