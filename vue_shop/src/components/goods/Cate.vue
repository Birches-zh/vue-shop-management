<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加分类 -->
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 树形表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :show-index="true"
        :expand-type="false"
        :selection-type="false"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted == false" class="el-icon-success" style="color:#0ca2aa"></i>
          <i v-else class="el-icon-error" style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level == 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 树形表格结束 -->

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
          <!-- 级联选择器 -->
          <el-cascader
            expand-trigger="hover"
            :options="getParentCateList"
            v-model="selectedKeys"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑对话框" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 数据源
      cateList: [],
      // 商品分类请求数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据数量
      total: 0,
      // 列表表格
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      //添加分类对话框
      addCateDialogVisible: false,
      //添加分类表单对象
      addCateForm: {
        // 父级分类的ID
        cat_pid: 0,
        // 将要分类的名称
        cat_name: "",
        // 分类的等级，0表示是1级分类
        cat_level: "0"
      },
      //添加分类提交规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //级联选择器的数据
      getParentCateList: [],
      //级联选择器配置对象
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      //级联选择器返回的数据，初始值为数组
      selectedKeys: [],
      //编辑对话框
      editCateDialogVisible: false,
      //编辑数据源
      editCateForm: {},
      //编辑数据源规则
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //编辑名称的id值
      editCateId: ""
    };
  },
  methods: {
    // 商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("请求数据失败，请稍后再试！");
      } else {
        this.cateList = res.data.result;
        this.total = res.data.total;
      }
    },
    // 分页选择器的显示数据的数量
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize;
      this.getCateList();
    },
    // 分页选择器的页面跳转
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum;
      this.getCateList();
    },
    // 添加分类对话框
    showAddCateDialog() {
      this.getParantCateList();
      this.addCateDialogVisible = true;
    },
    // 商品分类数据列表--针对级联选择器，只获取第二层的分类列表
    async getParantCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败，请稍后再试！");
      } else {
        this.getParentCateList = res.data;
        console.log(this.getParentCateList);
      }
    },
    // 级联选择器触发的事件
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        //选中父类的ID,传递给表单的数据源，修改iD值
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //传递给表单的数据源，修改层级
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        //如果没有选数据，那就把表单里的数据源恢复成初始值
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加数据失败，请稍后再试！");
          } else {
            this.$message.success("添加分类成功！");
            this.getCateList();
            this.addCateDialogVisible = false;
          }
        }
      });
    },
    // 监听添加分类对话框关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
    },
    // 显示编辑对话框
    async showEditCateDialog(cate) {
      const { data: res } = await this.$http.get(`categories/${cate.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类信息失败");
      }
      this.editCateId = cate.cat_id;
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    // 编辑分类名称
    async editCate() {
      const { data: res } = await this.$http.put(
        `categories/${this.editCateId}`,
        this.editCateForm
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新数据失败，请稍后再试！");
      } else {
        this.getCateList();
        this.editCateDialogVisible = false;
      }
      console.log(res);
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if(confirmResult == 'cancel'){
        return this.$message.error('您取消了删除')
      }else{
       const {data:res} = await this.$http.delete(`categories/${id.cat_id}`)
       if(res.meta.status !== 200 ){
         console.log(res)
         return this.$message.error('删除失败，请稍后再试！')
       }else{
         this.$message.success('删除成功')
         this.getCateList();
       }
      }
    }
  },
  created() {
    this.getCateList();
  }
};
</script>
<style lang="less">
.treeTable {
  margin-top: 15px;
}
.el-cascader-panel {
  height: 300px !important;
}
</style>