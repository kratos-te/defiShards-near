import { useMemo } from "react";
import { useQuery } from "react-query";
import {
  useNearLogin,
  useNearContext,
  useTxOutcome,
  RegisterProjectParameters,
  DepositProjectParameters,
  WithdrawProjectParameters,
} from "./Near";
import { LoadableResult } from "../types";
import { Project } from "./Near";

interface ProjectResult {
  project: LoadableResult<Project>;
  reload: () => void;
}

interface ProjectsResult {
  projects: LoadableResult<Project[]>;
  reload: () => void;
}

export const useProject = (projectId: number): ProjectResult => {
  const { neargenesisContract } = useNearContext();
  const { accountIdNear } = useNearLogin();

  const projectInfo = useQuery(
    ["fetchProjectInfoRaw", projectId, accountIdNear],
    async (): Promise<Project> => {
      const project: Project = await neargenesisContract.getProject(projectId);
      return project;
    },
    {
      enabled: Number(projectId) >= 0,
      cacheTime: 0,
    }
  );
  const project = useMemo((): LoadableResult<Project> => {
    if (projectInfo.isLoading) {
      return { isLoading: true, isError: false };
    }
    if (projectInfo.isError) {
      return { isLoading: false, isError: true, error: `${projectInfo.error}` };
    }

    const result = projectInfo.data!;

    return { isLoading: false, isError: false, value: result };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectInfo.isLoading,
    projectInfo.isError,
    projectInfo.data,
    projectInfo.isRefetching,
  ]);

  return {
    project,
    reload: () => projectInfo.refetch(),
  };
};

interface GetBalance {
  getBalance: (projectId: number) => Promise<string>;
  getWithdrawnBalance: (projectId: number) => Promise<string>;
}

export const useBalance = (): GetBalance => {
  const { neargenesisContract } = useNearContext();
  const { accountIdNear } = useNearLogin();

  const getBalance = async (projectId: number) => {
    const balance: string = await neargenesisContract.getNumBalances(
      projectId,
      accountIdNear
    );
    return balance;
  };

  const getWithdrawnBalance = async (projectId: number) => {
    const balance: string = await neargenesisContract.getWithdrawnAmount(
      projectId,
      accountIdNear
    );
    return balance;
  };

  return {
    getBalance,
    getWithdrawnBalance,
  };
};

export const useProjects = (
  startNum: number | null,
  limit: number | null
): ProjectsResult => {
  const { neargenesisContract } = useNearContext();
  const { accountIdNear } = useNearLogin();

  const projectInfo = useQuery(
    ["fetchProjectsInfoRaw", "allProjects", accountIdNear],
    async (): Promise<Project[] | null> => {
      const projects: Project[] = await neargenesisContract.getProjects(
        startNum,
        limit
      );
      return projects;
    }
  );
  const projects = useMemo((): LoadableResult<Project[]> => {
    if (projectInfo.isLoading) {
      return { isLoading: true, isError: false };
    }
    if (projectInfo.isError) {
      return { isLoading: false, isError: true, error: `${projectInfo.error}` };
    }

    const result = projectInfo.data!;

    return { isLoading: false, isError: false, value: result };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectInfo.isLoading,
    projectInfo.isError,
    projectInfo.data,
    projectInfo.isRefetching,
  ]);

  return {
    projects,
    reload: () => projectInfo.refetch(),
  };
};

interface RegisterProject {
  registerProject: (params: RegisterProjectParameters) => Promise<number>;
  useProjectRegistered: (action: (projectId: number) => void) => void;
}

export const useRegisterProject = (): RegisterProject => {
  const { neargenesisContract } = useNearContext();

  const registerProject = async (
    params: RegisterProjectParameters
  ): Promise<number> => {
    const projectId = await neargenesisContract.registerProject(
      params.accountId,
      params.inTokenContract,
      params.outTokenContract,
      params.paymentTokenContract,
      params.title,
      params.subTitle,
      params.logo,
      params.startingPrice,
      params.email,
      params.telegram,
      params.inTokenId,
      params.outTokenId,
      params.totalTokens,
      params.coingecko,
      params.facebook,
      params.instagram,
      params.twitter,
      params.description,
      params.startTime,
      params.endTime,
      params.cliffPeriod
    );
    return projectId;
  };

  const useProjectRegistered = (action: (projectId: number) => void) => {
    useTxOutcome((outcome) => {
      if (
        outcome.success &&
        outcome.originalFunctionCall?.methodName === "register_project"
      ) {
        action(outcome.successValue as number);
      }
    });
  };

  return {
    registerProject,
    useProjectRegistered,
  };
};

interface ActiveProject {
  activeProject: (params: DepositProjectParameters) => Promise<number>;
}

export const useActiveProject = (): ActiveProject => {
  const { neargenesisContract } = useNearContext();

  const activeProject = async (
    params: DepositProjectParameters
  ): Promise<number> => {
    const projectId = await neargenesisContract.activeProject(
      params.accountId,
      params.projectId,
      params.ftContract,
      params.amount
    );
    return projectId;
  };

  return {
    activeProject,
  };
};

interface ProjectDepositInToken {
  projectDepositInToken: (params: DepositProjectParameters) => Promise<number>;
}

export const useDepositInToken = (): ProjectDepositInToken => {
  const { neargenesisContract } = useNearContext();

  const projectDepositInToken = async (
    params: DepositProjectParameters
  ): Promise<number> => {
    const projectId = await neargenesisContract.projectDepositInToken(
      params.accountId,
      params.projectId,
      params.ftContract,
      params.amount
    );
    return projectId;
  };

  return {
    projectDepositInToken,
  };
};

interface projectWithdrawInToken {
  projectWithdrawInToken: (
    params: WithdrawProjectParameters
  ) => Promise<number>;
}

export const useWithdrawInToken = (): projectWithdrawInToken => {
  const { neargenesisContract } = useNearContext();

  const projectWithdrawInToken = async (
    params: WithdrawProjectParameters
  ): Promise<number> => {
    const projectId = await neargenesisContract.projectWithdrawInToken(
      params.projectId,
      params.amount,
      params.ftContract
    );
    return projectId;
  };

  return {
    projectWithdrawInToken,
  };
};

interface ProjectWithdrawOutToken {
  projectWithdrawOutToken: (params: WithdrawProjectParameters) => Promise<void>;
}

export const useWithdrawOutToken = (): ProjectWithdrawOutToken => {
  const { neargenesisContract } = useNearContext();

  const projectWithdrawOutToken = async (params: WithdrawProjectParameters) => {
    await neargenesisContract.projectWithdrawOutToken(
      params.projectId,
      params.amount,
      params.ftContract
    );
  };

  return {
    projectWithdrawOutToken,
  };
};

interface RemoveProject {
  removeProject: (projectId: number) => {};
}
export const useRemoveProject = (): RemoveProject => {
  const { neargenesisContract } = useNearContext();
  const removeProject = async (projectId: number) => {
    const res = await neargenesisContract.removeProject(projectId);
  };
  return { removeProject };
};

interface UpdateProject {
  updateProject: (params: { projectId: number; projectInput: any }) => {};
}
export const useUpdateProject = (): UpdateProject => {
  const { neargenesisContract } = useNearContext();
  const updateProject = async (params: {
    projectId: number;
    projectInput: any;
  }) => {
    await neargenesisContract.updateProject(
      params.projectId,
      params.projectInput
    );
  };
  return { updateProject };
};

interface PublishProject {
  publishProject: (projectId: number) => {};
}
export const usePublishProject = (): PublishProject => {
  const { neargenesisContract } = useNearContext();
  const publishProject = async (projectId: number) => {
    await neargenesisContract.publishProject(projectId);
  };
  return { publishProject };
};

interface HideProject {
  hideProject: (projectId: number) => {};
}
export const useHideProject = (): HideProject => {
  const { neargenesisContract } = useNearContext();
  const hideProject = async (projectId: number) => {
    await neargenesisContract.hideProject(projectId);
  };
  return { hideProject };
};
