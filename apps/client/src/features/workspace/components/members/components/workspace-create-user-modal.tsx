import { Button, Divider, Modal, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { WorkspaceInviteForm } from "./workspace-invite-form";

/**
 * 直接创建用户模态框组件
 * 用于管理员直接创建新用户，设置初始密码
 */
export default function WorkspaceCreateUserModal() {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>新增成员</Button>

      <Modal
        size="550"
        opened={opened}
        onClose={close}
        title="新增成员"
        centered
      >
        <Divider size="xs" mb="xs" />

        <ScrollArea h="80%">
          <WorkspaceInviteForm onClose={close} isDirectCreateDefault={true} />
        </ScrollArea>
      </Modal>
    </>
  );
}
