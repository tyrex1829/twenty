import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { useRecoilCallback } from 'recoil';

type OpenActivityTargetCellEditModeProps = {
  recordPickerInstanceId: string;
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
};

// TODO: deprecate this once we are supporting one to many through relations
export const useOpenActivityTargetCellEditMode = () => {
  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const openActivityTargetCellEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        recordPickerInstanceId,
        activityTargetObjectRecords,
      }: OpenActivityTargetCellEditModeProps) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue()
          .filter(
            (objectMetadataItem) =>
              objectMetadataItem.isSearchable &&
              objectMetadataItem.isActive &&
              objectMetadataItem.nameSingular !== CoreObjectNameSingular.Task &&
              objectMetadataItem.nameSingular !== CoreObjectNameSingular.Note &&
              objectMetadataItem.nameSingular !==
                CoreObjectNameSingular.WorkspaceMember,
          );

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          activityTargetObjectRecords.map((activityTargetObjectRecord) => ({
            recordId: activityTargetObjectRecord.targetObject.id,
            objectMetadataId:
              activityTargetObjectRecord.targetObjectMetadataItem.id,
            isSelected: true,
            isMatchingSearchFilter: true,
          })),
        );

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            {
              instanceId: recordPickerInstanceId,
            },
          ),
          objectMetadataItems,
        );

        set(
          multipleRecordPickerSearchFilterComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          '',
        );

        multipleRecordPickerPerformSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: objectMetadataItems,
          forcePickableMorphItems: activityTargetObjectRecords.map(
            (activityTargetObjectRecord) => ({
              recordId: activityTargetObjectRecord.targetObject.id,
              objectMetadataId:
                activityTargetObjectRecord.targetObjectMetadataItem.id,
              isSelected: true,
              isMatchingSearchFilter: true,
            }),
          ),
        });
      },
    [multipleRecordPickerPerformSearch],
  );

  return { openActivityTargetCellEditMode };
};
