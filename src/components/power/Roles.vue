<template>
  <div>
    <!-- 面包屑 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 视图区域 -->
    <el-card>

      <!-- 按钮 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 表格 角色列表 -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', index1 == 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!-- 1 级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 2 和 3 级权限 -->
              <el-col :span="19">
                <el-row :class="[index2 == 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightsById(scope.row, item2.id)" type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightsById(scope.row, item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="306">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
            <!-- 删除 -->
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <!-- 分配权限 -->
            <el-button @click="showSetRightsDialog(scope.row)" type="warning" size="mini" icon="el-icon-star-off">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 对话框 添加 角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog" width="30%" @close="roleDialogClosed('addRoleFormRef')">
      <!-- 主体 -->
      <el-form ref="addRoleFormRef" :rules="roleFormRules" :model="addRoleForm" label-width="60px">
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 对话框 修改 角色 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialog" width="30%" @close="roleDialogClosed('editRoleFormRef')">
      <!-- 主体 -->
      <el-form ref="editRoleFormRef" :rules="roleFormRules" :model="editRoleForm" label-width="60px">
        <el-form-item label="id">
          <el-input v-model="editRoleForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 对话框 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightsDialog" @close="closedSetRightsDialog" width="50%">
      <!-- 树形控件 -->
      <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defaultKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [], // 角色列表
      addRoleDialog: false, // 添加角色 对话框
      addRoleForm: { // 添加角色 表单
        roleName: '',
        roleDesc: ''
      },
      roleFormRules: { // 表单 验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      editRoleDialog: false, // 修改角色 对话框
      editRoleForm: { // 修改角色 表单
      },
      setRightsDialog: false, // 分配权限 对话框
      rightsList: [], // 权限列表
      treeProps: { // 树形控件 props 属性，绑定的对象
        label: 'authName',
        children: 'children'
      },
      //  默认选中的，节点 id 值数组
      defaultKeys: [],
      //  角色 id
      roleID: ''
    }
  },
  methods: {
    async getRolesList() { // 获取 角色列表 数据
      const { data: res } = await this.$axios.get('roles')
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('角色列表，获取失败！')
      this.rolesList = res.data
    },
    addRole() { // 添加角色 ——— 当点击 "确定" 按钮时
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return // 校验 未通过
        // 校验 通过
        const { data: res } = await this.$axios.post('roles', this.addRoleForm)
        if (res.meta.status != 201) return this.$message.error('添加失败！')
        this.$message.success('添加成功！')
        this.addRoleDialog = false
        this.getRolesList()
      })
    },
    roleDialogClosed(property) { // 当添加角色对话框，关闭时
      this.$refs[property].resetFields() // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
    },
    async editRole(id) { // 编辑角色
      // 根据 id 查询
      const { data: res } = await this.$axios.get('roles/' + id)
      if (res.meta.status != 200) return this.$message.error('查询失败！')
      this.editRoleForm = res.data
      this.editRoleDialog = true
    },
    editRoleInfo() { // 编辑角色 —— 当点击 "确定" 按钮时
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.put('roles/' + this.editRoleForm.roleId, this.editRoleForm)
        if (res.meta.status != 200) return this.$message.error('编辑角色，失败了！')
        this.$message.success('编辑角色，成功了！')
        this.getRolesList()
        this.editRoleDialog = false
      })
    },
    async deleteRole(id) { // 删除角色
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result != 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$axios.delete('roles/' + id)
      if (res.meta.status != 200) return this.$message.error('删除角色，失败了')
      this.$message.success('删除角色，成功了')
      this.getRolesList()
    },
    async removeRightsById(role, rightsId) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result != 'confirm') return this.$message.info('已取消了，删除操作！')
      const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightsId}`)
      if (res.meta.status != 200) return this.$message.error('删除权限，失败了！')
      this.$message.success('删除权限，成功了！')
      // this.getRolesList()
      role.children = res.data
    },
    //  显示 分配权限的 对话框
    async showSetRightsDialog(role) {
      this.roleID = role.id
      //  获取 所有权限列表
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status != 200) return this.$message.error('权限列表，获取失败了！')
      this.rightsList = res.data
      // console.log(this.rightsList)
      this.getLeafKeys(role, this.defaultKeys)
      this.setRightsDialog = true // 显示
    },
    //  关闭 分配权限的 对话框
    closedSetRightsDialog() {
      this.defaultKeys = []
    },
    //  通过递归的方式，获取角色下所有三级权限的 id 值，并保存到 defaultKeys 数组中
    getLeafKeys(node, arr) {
      //  若当前 node 节点不包含 children 属性，则是 三级权限 节点
      if (!node.children) {
        return arr.push(node.id)
      }
      //  否则，不是 三级权限 节点
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //  为角色分配权限，当点击 "确定" 按钮时触发
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const str = keys.join(',')
      const { data: res } = await this.$axios.post(`roles/${this.roleID}/rights`, { rids: str })
      if (res.meta.status != 200) return this.$message.error('为角色分配权限，失败了！')
      this.$message.success('为角色分配权限，成功了！')
      this.getRolesList()
      this.setRightsDialog = false
    }
  },
  created() {
    this.getRolesList() // 获取 角色列表 数据
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
