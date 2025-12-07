import { Group, Box, Button, TagsInput, Select, Switch, TextInput, PasswordInput, Divider, Text } from "@mantine/core";
import React, { useState } from "react";
import { MultiGroupSelect } from "@/features/group/components/multi-group-select.tsx";
import { UserRole } from "@/lib/types.ts";
import { userRoleData } from "@/features/workspace/types/user-role-data.ts";
import { useCreateInvitationMutation, useCreateUserDirectlyMutation } from "@/features/workspace/queries/workspace-query.ts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
  isDirectCreateDefault?: boolean;
}
export function WorkspaceInviteForm({ onClose, isDirectCreateDefault = false }: Props) {
  const { t } = useTranslation();
  const [emails, setEmails] = useState<string[]>([]);
  const [singleEmail, setSingleEmail] = useState<string>("");
  const [role, setRole] = useState<string | null>(UserRole.MEMBER);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [isDirectCreate, setIsDirectCreate] = useState<boolean>(isDirectCreateDefault);
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const createInvitationMutation = useCreateInvitationMutation();
  const createUserDirectlyMutation = useCreateUserDirectlyMutation();
  const navigate = useNavigate();

  async function handleSubmit() {
    let validEmails: string[] = [];
    
    if (isDirectCreate) {
      // Direct user creation - single email input
      if (!singleEmail) {
        alert(t("Please enter a valid email address"));
        return;
      }
      
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(singleEmail)) {
        alert(t("Please enter a valid email address"));
        return;
      }
      
      validEmails = [singleEmail];
    } else {
      // Regular invitation - multiple emails
      validEmails = emails.filter((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      });
      
      if (validEmails.length === 0) {
        alert(t("Please enter at least one valid email address"));
        return;
      }
    }

    if (isDirectCreate) {
      await createUserDirectlyMutation.mutateAsync({
        role: role.toLowerCase(),
        emails: validEmails,
        groupIds: groupIds,
        name: name,
        password: password,
      });
    } else {
      // Regular invitation
      await createInvitationMutation.mutateAsync({
        role: role.toLowerCase(),
        emails: validEmails,
        groupIds: groupIds,
      });
    }

    onClose();

    navigate("?tab=invites");
  }

  const handleGroupSelect = (value: string[]) => {
    setGroupIds(value);
  };

  return (
    <>
      <Box maw="500" mx="auto">
        {/*<WorkspaceInviteSection /> */}

        {/* Email input - single for direct create, multiple for invite */}
        {isDirectCreate ? (
          <TextInput
            mt="sm"
            description={t("Enter the user's email address")}
            label={t("Email")}
            placeholder={t("example@company.com")}
            variant="filled"
            onChange={(e) => setSingleEmail(e.target.value)}
            required
          />
        ) : (
          <TagsInput
            mt="sm"
            description={t(
              "Enter valid email addresses separated by comma or space max_50",
            )}
            label={t("Email addresses")}
            placeholder={t("enter valid emails addresses")}
            variant="filled"
            splitChars={[",", " "]}
            maxDropdownHeight={200}
            maxTags={50}
            onChange={setEmails}
          />
        )}

        <Select
          mt="sm"
          description={isDirectCreate 
            ? t("Select role to assign to the user") 
            : t("Select role to assign to all members")
          }
          label={t("Select role")}
          placeholder={t("Choose a role")}
          variant="filled"
          data={userRoleData
            .filter((role) => role.value !== UserRole.OWNER)
            .map((role) => ({
              ...role,
              label: t(`${role.label}`),
              description: t(`${role.description}`),
            }))}
          defaultValue={UserRole.MEMBER}
          allowDeselect={false}
          checkIconPosition="right"
          onChange={setRole}
        />

        {/* Hide direct create toggle when default is true (from Add Member button) */}
        {!isDirectCreateDefault && (
          <Box mt="sm">
            <Box mb="xs">
              <Text size="sm" fw={500}>
                {t("Direct user creation")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("Create user directly with initial password instead of sending invitation")}
              </Text>
            </Box>
            <Group justify="flex-end">
              <Switch
                checked={isDirectCreate}
                onChange={(e) => setIsDirectCreate(e.currentTarget.checked)}
              />
            </Group>
          </Box>
        )}

        {isDirectCreate && (
          <>
            <Divider my="sm" />
            
            <TextInput
              mt="sm"
              description={t("Enter the user's full name")}
              label={t("Full name")}
              placeholder={t("John Doe")}
              variant="filled"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <PasswordInput
              mt="sm"
              description={t("Set initial password for the user")}
              label={t("Initial password")}
              placeholder={t("Enter strong password")}
              variant="filled"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </>
        )}

        <MultiGroupSelect
          mt="sm"
          description={isDirectCreate 
            ? t("User will be granted access to spaces the groups can access") 
            : t("Members will be granted access to spaces the groups can access")
          }
          label={t("Add to groups")}
          onChange={handleGroupSelect}
        />

        <Group justify="flex-end" mt="md">
          <Button
            onClick={handleSubmit}
            loading={createInvitationMutation.isPending || createUserDirectlyMutation.isPending}
          >
            {isDirectCreate ? t("Create User") : t("Send invitation")}
          </Button>
        </Group>
      </Box>
    </>
  );
}
