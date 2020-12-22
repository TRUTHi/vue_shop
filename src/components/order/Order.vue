<template>
  <div>
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 视图区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="250"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay == '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" width="190">
          <template slot-scope="scope">{{ scope.row.create_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAddress"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="progress"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryConditions.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryConditions.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址 对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressDialogVisible"
      width="50%"
      @close="editAddressDialogClosed"
    >
      <el-form
        :model="editAddressForm"
        :rules="editAddressFormRules"
        ref="editAddressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="addressChoice">
          <el-cascader
            v-model="editAddressForm.addressChoice"
            :options="citydata"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailedAddress">
          <el-input v-model="editAddressForm.detailedAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度 对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressData"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata' // 省市区|县
import progressData from './progress' // 物流进度
export default {
  data() {
    return {
      //  查询条件
      queryConditions: {
        query: '', // 搜索的 关键字
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示的 条数
      },
      //  订单列表
      orderList: [],
      //  订单列表 总条数
      total: 0,
      //  省市区|县
      citydata,
      //  对话框 修改地址
      editAddressDialogVisible: false,
      //  修改地址 表单
      editAddressForm: {
        addressChoice: [], // 省市区|县
        detailedAddress: '' // 详细地址
      },
      //  修改地址 表单 验证规则
      editAddressFormRules: {
        detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
        addressChoice: [{ required: true, message: '请选择省市区|县', trigger: 'blur' }]
      },
      //  对话框 物流进度
      progressVisible: false,
      progressData
    }
  },
  methods: {
    //  获取 订单列表
    async getOrderList() {
      const { data: res } = await this.$axios.get('orders', { params: this.queryConditions })
      if (res.meta.status != 200) { return this.$message.error('获取 —— 订单列表，失败了') }
      //  存储 数据
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    //  分页 改变每页显示的条数时，被触发
    handleSizeChange(newSize) {
      this.queryConditions.pagesize = newSize
      this.getOrderList()
    },
    //  分页 改变当前页码时，被处罚
    handleCurrentChange(newPage) {
      this.queryConditions.pagenum = newPage
      this.getOrderList()
    },
    //  修改地址 对话框 显示
    editAddress() {
      this.editAddressDialogVisible = true
    },
    //  修改地址 对话框 关闭
    editAddressDialogClosed() {
      this.$refs.editAddressFormRef.resetFields() // 重置
    },
    //  物流进度 对话框 显示
    async progress() {
      //  获取 物流信息
      this.progressVisible = true
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
