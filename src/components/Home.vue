<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 主体 -->
    <el-container>

      <!-- 左侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">

        <!-- 折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <!-- 栏菜单 -->
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">

          <!-- 1 级 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 模版 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 2 级 -->
            <el-menu-item :index="'/' + subItem.path" @click="saveNavState('/' + subItem.path)" v-for="subItem in item.children" :key="subItem.id">
              <!-- 模版 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>

          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内用主体 -->
      <el-main>
        <router-view/>
      </el-main>

    </el-container>

  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单栏
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清空
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('login')
    },
    async getMenuList() {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  letter-spacing: 0.2em;
}
</style>
