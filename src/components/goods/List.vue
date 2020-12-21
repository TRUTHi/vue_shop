<template>
  <div>
    <!-- 面包屑 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 视图区域 -->
    <el-card>
      <!-- 第一行 -->
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryConditions.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 第二列 -->
        <el-col :span="4">
          <!-- 添加商品 按钮 -->
          <el-button type="primary" @click="goToAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 商品列表数据 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格 (元)"
          prop="goods_price"
          width="120"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="80"
        ></el-table-column>
        <el-table-column label="创建时间" width="185">
          <template slot-scope="scope">{{
            scope.row.add_time | dateFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoodsById(scope.row.goods_id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryConditions.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryConditions.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryConditions: {
        query: '', // 关键字
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示条数
      },
      // 商品列表数据
      goodsList: [],
      // 商品列表数据 总条数
      total: 0
    }
  },
  methods: {
    // 获取 商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryConditions
      })
      if (res.meta.status != 200) {
        return this.$message.error('获取 —— 商品列表数据，失败了！')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 当每页显示的 "条数" 发生改变时
    handleSizeChange(newSize) {
      this.queryConditions.pagesize = newSize // 重新 赋值
      this.getGoodsList() // 重新 获取
    },
    // 每当 "页码" 发生改变时
    handleCurrentChange(newPage) {
      this.queryConditions.pagenum = newPage // 重新 赋值
      this.getGoodsList() // 重新 获取
    },
    // 移除 商品信息
    async removeGoodsById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result != 'confirm') {
        return this.$message.info('已取消，删除操作！')
      }
      const { data: res } = await this.$axios.delete('goods/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('删除商品，失败了！')
      }
      this.$message.success('删除商品，成功了！')
      this.getGoodsList()
    },
    // 跳转到 添加商品 页面
    goToAddGoodsPage() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>
