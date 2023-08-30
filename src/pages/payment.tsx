import TitleCard from "../components/TitleCard";
import Loading from "../components/Loading";
import DeleteConfirm from "../components/Confirm";
import { TimeDivision } from "../utils/const";
import { ShortMonthNames } from "../utils/const";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Button,
  Text,
  Input,
  IconButton,
  ButtonGroup,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  useProjects,
  useRemoveProject,
  useUpdateProject,
  usePublishProject,
  useHideProject,
} from "../hooks/project";
import { useColor } from "../hooks/color";
import { useEffect, useState, useRef } from "react";
import Confirm from "../components/Confirm";

export default function Payment() {
  const [deleteTitle, setDeleteTitle] = useState<string>("");
  const { projects } = useProjects(null, null);
  const color = useColor();
  const { removeProject } = useRemoveProject();
  const { updateProject } = useUpdateProject();
  const { publishProject } = usePublishProject();
  const { hideProject } = useHideProject();
  const [isEdit, setIsEdit] = useState<number>(-1);
  const [title, setTitle] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  // const [tableIndex, setTableIndex] = useState

  //Update Projects
  const handleEdit = (projectInput: any) => {
    // projects[id].name = 'AAAAAAA'
    setIsEdit(-1);
    let inputData = projectInput;
    let id: number = projectInput.project_id;
    inputData.title = title;
    updateProject({ projectId: id, projectInput: inputData });
  };

  //Remove Projects

  const handleRemove = (projectId: number) => {
    removeProject(projectId);
  };

  const handlePublish = (projectId: number) => {
    publishProject(projectId);
  };

  const handleHide = (projectId: number) => {
    hideProject(projectId);
  };
  return (
    <>
      <TitleCard title="PAYMENT LISTING" />
      <Flex
        width="100%"
        marginY="4"
        padding="8"
        shadow="lg"
        border="1px solid"
        borderRadius="2xl"
        borderColor="rock.300"
        flexDirection="column"
        bgColor={color.cardBg}
      >
        {projects.isLoading ? (
          <Loading />
        ) : projects.isError ? (
          <Flex justifyContent={"center"}>
            <Text>Contract not initialized.</Text>
          </Flex>
        ) : projects.value.length <= 0 ? (
          <Flex justifyContent={"center"}>
            <Text>There are no active IDO Listings at the moment.</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    No(ID)
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Project Name
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Owner
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Contract
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Start Time / End Time
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Token Deposit
                  </Th>
                  <Th
                    textAlign={"center"}
                    color={color.cardTitle}
                    borderColor={color.cardSubtitle}
                  >
                    Mode
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {projects.value.map((project, index) => {
                  const startTime = project.start_time / TimeDivision;
                  const endTime = project.end_time / TimeDivision;
                  const date = new Date(endTime); // create new Date object
                  const start_date = new Date(startTime); // create new Date object
                  const publishState = project.is_published;
                  return (
                    <Tr key={index}>
                      <Td
                        isNumeric
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {index + 1} ({project.project_id})
                      </Td>
                      <Td
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {isEdit >= 0 && index == isEdit ? (
                          <Input
                            defaultValue={project.title}
                            border="1px #3a72af solid"
                            onChange={(e) => {
                              setTitle(e.target.value);
                            }}
                          ></Input>
                        ) : (
                          <Input
                            value={project.title}
                            isReadOnly
                            width="auto"
                            variant="unstyled"
                            textAlign={"center"}
                          ></Input>
                        )}
                      </Td>
                      <Td
                        isNumeric
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {project.owner_id}
                      </Td>
                      <Td
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {project.out_token_account_id}
                      </Td>
                      <Td
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {start_date.toLocaleString()}<br/>
                        {date.toLocaleString()}
                      </Td>
                      <Td
                        textAlign={"center"}
                        color={project.is_activated ? "#24eb00" : "tomato"}
                        borderColor={color.cardSubtitle}
                      >
                        {project.is_activated ? "Deposited" : "No Deposit"}
                      </Td>
                      <Td
                        textAlign={"center"}
                        color={color.cardSubtitle}
                        borderColor={color.cardSubtitle}
                      >
                        {!publishState ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handlePublish(project.project_id);
                            }}
                          >
                            PUBLISH
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            color={"tomato"}
                            onClick={() => {
                              handleHide(project.project_id);
                            }}
                          >
                            HIDE
                          </Button>
                        )}{" "}
                        |
                        {isEdit >= 0 && index == isEdit ? (
                          <ButtonGroup justifyContent="center" size="sm">
                            <IconButton
                              aria-label="yes"
                              onClick={() => {
                                handleEdit(project);
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              aria-label="no"
                              onClick={() => {
                                setIsEdit(-1);
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </ButtonGroup>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setIsEdit(index);
                            }}
                          >
                            EDIT
                          </Button>
                        )}{" "}
                        |
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleRemove(project.project_id);
                          }}
                        >
                          REMOVE
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
                {/* <DeleteConfirm title={project.title}/> */}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Flex>
    </>
  );
}
