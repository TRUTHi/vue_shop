<template>
  <div>
    <!-- 面包屑 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 视图区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="parseInt(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-position="top"
        label-width="100px"
      >
        <!-- 标签页 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoryList"
                :props="cascaderProps"
                @change="handleCascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="val"
                  v-for="(val, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="actionURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="requestHead"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 对话框 预览图片 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品 表单
      addGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [], // 商品所属的分类
        pics: [], // 上传的图片
        goods_introduce: '',
        attrs: [] // 动态参数 静态属性
      },
      // 添加商品 表单验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品的 3 级分类',
            trigger: 'change'
          }
        ]
      },
      // 商品分类 信息
      categoryList: [],
      // 商品分类 级联选择器 配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品分类 动态参数
      manyTableData: [],
      // 商品分类 静态属性
      onlyTableData: [],
      // 上传图片的 url
      actionURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的 请求头配置对象
      requestHead: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片 url
      previewPath: '',
      // 预览图片 对话框
      previewVisible: false
    }
  },
  methods: {
    // 获取 商品分类 信息
    async getCategoryList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类信息，失败了！')
      }
      this.categoryList = res.data
      console.log(this.categoryList)
    },
    // 商品分类 级联选择器 选项发生改变时
    handleCascaderChange() {
      if (this.addGoodsForm.goods_cat.length != 3) {
        // 没有选中 3 级分类
        this.addGoodsForm.goods_cat.length = [] // 清空
      }
    },
    // 在标签页切换之前，被触发
    beforeTabsLeave(activeName, oldActiveName) {
      // activeName 跳转到的标签页 name
      // oldActiveName 在跳转之前的标签页 name
      if (oldActiveName == 0 && this.addGoodsForm.goods_cat.length != 3) {
        this.$message.info('请选择商品 3 级分类')
        return false
      }
    },
    // 在点击切换标签页时，被触发
    async tabClicked() {
      if (this.activeIndex == '1') {
        const { data: res } = await this.$axios.get(
          'categories/' + this.categoryId + '/attributes',
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('获取商品参数，失败了！')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex == '2') {
        const { data: res } = await this.$axios.get(
          'categories/' + this.categoryId + '/attributes',
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('获取商品属性，失败了！')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 点击文件列表中已上传的文件时，被触发
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 文件列表移除文件时，被触发
    handleRemove(file) {
      // console.log(file)
      const path = file.response.data.tmp_path
      const index = this.addGoodsForm.pics.findIndex(item => item.pic == path)
      this.addGoodsForm.pics.splice(index, 1)
      console.log(this.addGoodsForm.pics)
    },
    // 文件上传成功时，被触发
    handleSuccess(response) {
      // console.log(response)
      const pic = { pic: response.data.tmp_path }
      this.addGoodsForm.pics.push(pic)
      console.log(this.addGoodsForm.pics)
    },
    // 添加商品
    add() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写必要的表单项！')
        } else {
          // 处理 goods_cat
          const form = _.cloneDeep(this.addGoodsForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理 动态参数
          this.manyTableData.forEach(item => {
            var object = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addGoodsForm.attrs.push(object)
          })
          // 处理 静态属性
          this.onlyTableData.forEach(item => {
            var object = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addGoodsForm.attrs.push(object)
          })
          form.attrs = this.addGoodsForm.attrs
          // console.log(form)
          const { data: res } = await this.$axios.post('goods', form)
          if (res.meta.status != 201) {
            return this.$message.error('添加商品，失败了！')
          }
          this.$message.success('添加商品，成功了！')
          this.$router.push('/goods')
        }
      })
    }
  },
  computed: {
    // 获取 商品分类的 3 级分类 id
    categoryId() {
      if (this.addGoodsForm.goods_cat.length == 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  },
  created() {
    this.getCategoryList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin-right: 15px;
}

.el-checkbox.is-bordered + .el-checkbox.is-bordered {
  margin-left: 0;
}

.previewImg {
  width: 100%;
}

.btn {
  margin-top: 15px;
}
</style>
