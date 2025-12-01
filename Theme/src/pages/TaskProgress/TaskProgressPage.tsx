import React, { useState } from 'react';
import styles from './TaskProgressPage.module.css';

type TaskStatus = '待分配' | '已分配' | '已完成';

interface Task {
  id: string;
  taskName: string;
  status: TaskStatus;
  assignees: string[];
  progress: number;
  reminded: boolean;
}

interface TeamWithTasks {
  teamId: string;
  teamName: string;
  tasks: Task[];
}

interface JoinedTask {
  id: string;
  taskName: string;
  status: TaskStatus;
  supervisor: string;
  progress: number;
}

interface JoinedTeamWithTasks {
  teamId: string;
  teamName: string;
  tasks: JoinedTask[];
}

const TaskProgressPage: React.FC = () => {
  const [createdTeams, setCreatedTeams] = useState<TeamWithTasks[]>([
    {
      teamId: '1',
      teamName: '团队1',
      tasks: [
        {
          id: '1-1',
          taskName: '任务一',
          status: '待分配',
          assignees: [],
          progress: 0,
          reminded: false
        },
        {
          id: '1-2',
          taskName: '任务二',
          status: '已分配',
          assignees: ['王xx'],
          progress: 50,
          reminded: true
        }
      ]
    },
    {
      teamId: '2',
      teamName: '团队2',
      tasks: [
        {
          id: '2-1',
          taskName: '任务一',
          status: '已分配',
          assignees: ['李xx', '张xx'],
          progress: 20,
          reminded: false
        }
      ]
    }
  ]);

  const [joinedTeams] = useState<JoinedTeamWithTasks[]>([
    {
      teamId: '1',
      teamName: '团队1',
      tasks: [
        {
          id: '1-1',
          taskName: '任务一',
          status: '已完成',
          supervisor: '李xx',
          progress: 100
        },
        {
          id: '1-2',
          taskName: '任务二',
          status: '已完成',
          supervisor: '李xx',
          progress: 100
        }
      ]
    },
    {
      teamId: '2',
      teamName: '团队2',
      tasks: [
        {
          id: '2-1',
          taskName: '任务一',
          status: '已完成',
          supervisor: '张xx',
          progress: 100
        }
      ]
    },
    {
      teamId: '3',
      teamName: '团队3',
      tasks: [
        {
          id: '3-1',
          taskName: '任务一',
          status: '已分配',
          supervisor: '王xx',
          progress: 60
        },
        {
          id: '3-2',
          taskName: '任务二',
          status: '已分配',
          supervisor: '王xx',
          progress: 30
        }
      ]
    }
  ]);

  // 管理每个团队的展开状态
  const [expandedCreatedTeams, setExpandedCreatedTeams] = useState<Record<string, boolean>>({});
  const [expandedJoinedTeams, setExpandedJoinedTeams] = useState<Record<string, boolean>>({});

  // 切换团队展开/收起状态
  const toggleCreatedTeam = (teamId: string) => {
    setExpandedCreatedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const toggleJoinedTeam = (teamId: string) => {
    setExpandedJoinedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // 添加负责人
  const handleAddAssignee = (teamId: string, taskId: string) => {
    const assignee = prompt('请输入负责人姓名：');
    if (assignee) {
      setCreatedTeams(prev =>
        prev.map(team =>
          team.teamId === teamId
            ? {
                ...team,
                tasks: team.tasks.map(task =>
                  task.id === taskId
                    ? {
                        ...task,
                        assignees: [...task.assignees, assignee],
                        status: '已分配' as TaskStatus
                      }
                    : task
                )
              }
            : team
        )
      );
    }
  };

  // 一键提醒
  const handleRemind = (teamId: string, taskId: string) => {
    setCreatedTeams(prev =>
      prev.map(team =>
        team.teamId === teamId
          ? {
              ...team,
              tasks: team.tasks.map(task =>
                task.id === taskId ? { ...task, reminded: true } : task
              )
            }
          : team
      )
    );
    console.log(`已提醒任务 ${taskId} 的负责人`);
    // TODO: 调用后端 API 发送提醒
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollableContentArea}>
        <div className={styles.contentArea}>
          {/* 我创建的区块 */}
          <div className={styles.createdSection}>
            <div className={styles.sectionTitle}>我创建的</div>

            <div className={styles.tableContainer}>
              {/* 标题行 */}
              <div className={styles.headerRow}>
                <div className={styles.headerCell}>团队名</div>
                <div className={styles.headerCell}>状态</div>
                <div className={styles.headerCell}>负责人</div>
                <div className={styles.headerCell}>任务进度</div>
                <div className={styles.headerCell}>一键提醒</div>
              </div>

              {/* 团队及其任务数据行 */}
              {createdTeams.map(team => (
                <div key={team.teamId}>
                  {/* 团队父级行（可点击折叠/展开） */}
                  <div 
                    className={styles.teamRow}
                    onClick={() => toggleCreatedTeam(team.teamId)}
                  >
                    <div className={styles.rowCell}>
                      <span className={styles.expandIcon}>
                        {expandedCreatedTeams[team.teamId] ? '▼' : '▶'}
                      </span>
                      {team.teamName}
                    </div>
                    <div className={styles.rowCell}>-</div>
                    <div className={styles.rowCell}>-</div>
                    <div className={styles.rowCell}>-</div>
                    <div className={styles.rowCell}>-</div>
                  </div>

                  {/* 子任务行（仅在展开时显示） */}
                  {expandedCreatedTeams[team.teamId] && team.tasks.map(task => (
                    <div key={task.id} className={styles.taskRow}>
                      <div className={styles.rowCell}>{task.taskName}</div>
                      <div className={styles.rowCell}>{task.status}</div>
                      <div className={styles.rowCell}>
                        {task.assignees.length > 0 ? (
                          task.assignees.length === 1 ? (
                            task.assignees[0]
                          ) : (
                            <select className={styles.assigneeSelect}>
                              {task.assignees.map((assignee, idx) => (
                                <option key={idx} value={assignee}>
                                  {assignee}
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          <button
                            className={styles.addAssigneeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddAssignee(team.teamId, task.id);
                            }}
                          >
                            添加负责人
                          </button>
                        )}
                      </div>
                      <div className={styles.rowCell}>
                        <div className={styles.progressContainer}>
                          <span className={styles.progressText}>{task.progress}%</span>
                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.rowCell}>
                        {task.assignees.length > 0 && (
                          <button
                            className={`${styles.remindButton} ${
                              task.reminded ? styles.reminded : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemind(team.teamId, task.id);
                            }}
                            disabled={task.reminded}
                          >
                            {task.reminded ? '已提醒' : '提醒'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* 底部占位空行 */}
              <div className={styles.placeholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
              <div className={styles.placeholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
              {/* 最后一行（粉色） */}
              <div className={styles.lastPlaceholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className={styles.separator} />

          {/* 我加入的区块 */}
          <div className={styles.joinedSection}>
            <div className={styles.sectionTitle}>我加入的</div>

            <div className={styles.tableContainer}>
              {/* 标题行 */}
              <div className={styles.headerRow}>
                <div className={styles.headerCell}>团队名</div>
                <div className={styles.headerCell}>状态</div>
                <div className={styles.headerCell}>上级</div>
                <div className={styles.headerCell}>任务进度</div>
              </div>

              {/* 团队及其任务数据行 */}
              {joinedTeams.map(team => (
                <div key={team.teamId}>
                  {/* 团队父级行（可点击折叠/展开） */}
                  <div 
                    className={styles.teamRow}
                    onClick={() => toggleJoinedTeam(team.teamId)}
                  >
                    <div className={styles.rowCell}>
                      <span className={styles.expandIcon}>
                        {expandedJoinedTeams[team.teamId] ? '▼' : '▶'}
                      </span>
                      {team.teamName}
                    </div>
                    <div className={styles.rowCell}>-</div>
                    <div className={styles.rowCell}>-</div>
                    <div className={styles.rowCell}>-</div>
                  </div>

                  {/* 子任务行（仅在展开时显示） */}
                  {expandedJoinedTeams[team.teamId] && team.tasks.map(task => (
                    <div key={task.id} className={styles.taskRow}>
                      <div className={styles.rowCell}>{task.taskName}</div>
                      <div className={styles.rowCell}>{task.status}</div>
                      <div className={styles.rowCell}>{task.supervisor}</div>
                      <div className={styles.rowCell}>
                        <div className={styles.progressContainer}>
                          <span className={styles.progressText}>{task.progress}%</span>
                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* 底部占位空行 */}
              <div className={styles.placeholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
              <div className={styles.placeholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
              <div className={styles.placeholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
              {/* 最后一行（粉色） */}
              <div className={styles.lastPlaceholderRow}>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
                <div className={styles.rowCell}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressPage;
