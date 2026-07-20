package com.ajp.mentorportal.group;

import com.ajp.mentorportal.common.ResourceNotFoundException;
import com.ajp.mentorportal.group.dto.CreateGroupRequest;
import com.ajp.mentorportal.group.dto.GroupResponse;
import com.ajp.mentorportal.group.dto.MemberInfo;
import com.ajp.mentorportal.user.User;
import com.ajp.mentorportal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public Page<GroupResponse> getAllGroups(Pageable pageable) {
        return groupRepository.findAll(pageable).map(this::toResponse);
    }

    public List<GroupResponse> searchGroups(String name) {
        return groupRepository.findByNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).toList();
    }

    public GroupResponse getGroupById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        return toResponse(group);
    }

    public GroupResponse createGroup(CreateGroupRequest request, Long userId) {
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdById(userId)
                .build();
        return toResponse(groupRepository.save(group));
    }

    public GroupResponse updateGroup(Long id, CreateGroupRequest request) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        return toResponse(groupRepository.save(group));
    }

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }

    public void addMembers(Long groupId, List<Long> userIds) {
        for (Long userId : userIds) {
            if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
                groupMemberRepository.save(GroupMember.builder()
                        .groupId(groupId)
                        .userId(userId)
                        .build());
            }
        }
    }

    public void removeMember(Long groupId, Long userId) {
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    private GroupResponse toResponse(Group group) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        String createdByName = userRepository.findById(group.getCreatedById())
                .map(u -> u.getFirstName() + " " + u.getLastName()).orElse("Unknown");

        List<MemberInfo> memberInfos = members.stream().map(m -> {
            User u = userRepository.findById(m.getUserId()).orElse(null);
            if (u == null) return null;
            return MemberInfo.builder()
                    .userId(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .email(u.getEmail())
                    .build();
        }).filter(java.util.Objects::nonNull).toList();

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .createdBy(group.getCreatedById())
                .createdByName(createdByName)
                .memberCount(members.size())
                .members(memberInfos)
                .createdAt(group.getCreatedAt())
                .build();
    }
}
