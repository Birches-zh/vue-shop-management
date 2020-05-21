<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRolesDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 权限列表展开 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom',i1 ==0 ? 'bdtop' : '']"
              v-for="(item1,i1 ) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter',i2 === 0? '': 'bdtop']"
                  v-for="(item2,i2 ) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3,i3 ) in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRolesDialog(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限窗口 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- 树形结构数据 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        :default-checked-keys="defkeys"
        node-key="id"
        show-checkbox
        default-expand-all
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色窗口 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <el-form
        :model="addRoleForm"
        :rules="Rolerules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色窗口 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialogVisible" width="50%">
      <el-form
        :model="editRolesForm"
        :rules="editRolesRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //列表数据
      rolesList: [],
      //分配权限对话框
      setRightsDialogVisible: false,
      // 添加角色对话框
      addRolesDialogVisible: false,
      // 编辑角色对话框
      editRolesDialogVisible: false,
      //获取分配权限的数据
      rightslist: [],
      //分配权限的ID值
      roleId: "",
      // 修改角色状态的ID值
      editRoleId: "",
      //树形控件的参数规则
      treeProps: {
        children: "children",
        label: "authName"
      },
      //默认勾选的数组
      defkeys: [],
      // 添加角色数据
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加角色数据规则
      Rolerules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 5, message: "长度在 2 到 5 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ]
      },
      // 要被修改的数据
      editRolesForm: {},
      // 要被修改的数据规则
      editRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 5, message: "长度在 2 到 5 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    //获取列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表数据失败！");
      this.rolesList = res.data;
    },
    //删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confirmResult == "cancel") {
        return this.$message.error("您取消了删除！");
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("取消权限失败！");
        } else {
          // 服务器返回的数据就是最新的数据，所以不需要重新向服务器发生请求获取数据导致刷新页面
          console.log(res.data);
          role.children = res.data;
        }
      }
    },
    // 展示分配权限对话框
    async showSetRightsDialog(role) {
      this.roleId = role.id;
      this.setRightsDialogVisible = true;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取分配权限数据失败，请稍后再试！");
      this.rightslist = res.data;
      this.getLeafKeys(role, this.defkeys);
    },
    // 默认勾选,通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      //通过遍历的形式去调用getLeafKeys判断是否是三级权限
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200)
        return this.$message.error("角色授权更新失败，请稍后再试！");
      console.log(res.data);
      this.$message.success("角色授权更新成功");
      this.getRolesList();
      this.setRightsDialogVisible = false;
    },
    // 关闭时取消无关联的权限
    setRightsDialogClosed() {
      this.defkeys = [];
    },
    //添加角色对话框
    showAddRolesDialog() {
      this.addRolesDialogVisible = true;
    },
    //关闭窗口时清除输入框的内荣
    addRolesDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请输入正确的角色名称和角色描述");
        } else {
          const { data: res } = await this.$http.post(
            "roles",
            this.addRoleForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加角色信息失败，请稍后再试！");
          } else {
            this.$message.success("添加成功！");
            this.getRolesList();
            this.addRolesDialogVisible = false;
          }
        }
      });
    },
    //编辑角色对话框
    async showEditRolesDialog(role) {
      const { data: res } = await this.$http.get("roles/" + role.id);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户信息失败");
      this.editRoleId = role.id;
      this.editRolesForm = res.data;
      this.editRolesDialogVisible = true;
    },
    //编辑角色状态
    editRoles() {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请输入正确的角色名称或角色描述！");
        } else {
          const { data: res } = await this.$http.put(
            `roles/${this.editRoleId}`,
            this.editRolesForm
          );
          if (res.meta.status !== 200) {
            return this.$message.error("修改失败，请稍后再试！");
          } else {
            this.$message.success("修改成功");
            this.getRolesList();
            this.editRolesDialogVisible = false;
          }
        }
      });
    },
    // 删除角色
    async deleteRoles(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("您取消了删除!");
      } else {
        console.log(id)
        const { data: res } = await this.$http.delete("roles/" + id);
        if (res.meta.status !== 200) {
          return this.$message.error("删除角色失败，请稍后再试！");
        } else {
          this.$message.success("删除角色成功！");
          this.getRolesList();
        }
      }
    }
  },
  created() {
    //获取列表数据
    this.getRolesList();
  }
};
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