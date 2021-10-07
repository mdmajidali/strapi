import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Stack } from '@strapi/parts/Stack';
import { IconButton } from '@strapi/parts/IconButton';
import DeleteIcon from '@strapi/icons/DeleteIcon';
import DownloadIcon from '@strapi/icons/DownloadIcon';
import Resize from '@strapi/icons/Resize';
import { prefixFileUrlWithBackendUrl } from '@strapi/helper-plugin';
import getTrad from '../../../utils/getTrad';
import { downloadFile } from '../../../utils/downloadFile';
import { RemoveAssetDialog } from '../RemoveAssetDialog';
import { useCropImg } from '../../../hooks/useCropImg';
import { useEditAsset } from '../../../hooks/useEditAsset';
import {
  RelativeBox,
  ActionRow,
  Wrapper,
  BadgeOverride,
  UploadProgressWrapper,
} from './components';
import { CroppingActions } from './CroppingActions';
import { CopyLinkButton } from './CopyLinkButton';
import { UploadProgress } from '../../UploadProgress';

export const PreviewBox = ({ asset, onDelete }) => {
  const previewRef = useRef(null);
  const { formatMessage } = useIntl();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { crop, produceFile, stopCropping, isCropping, width, height } = useCropImg();
  const { editAsset, error, isLoading, progress, cancel } = useEditAsset();

  const assetUrl = prefixFileUrlWithBackendUrl(asset.url);

  const handleCropping = async () => {
    const nextAsset = { ...asset, width, height };

    const file = await produceFile(nextAsset.name, nextAsset.mime, nextAsset.updatedAt);

    await editAsset(nextAsset, file);
    stopCropping();
  };

  const isInCroppingMode = isCropping && !isLoading;

  return (
    <>
      <RelativeBox hasRadius background="neutral150" borderColor="neutral200">
        {isInCroppingMode && (
          <CroppingActions onValidate={handleCropping} onCancel={stopCropping} />
        )}

        <ActionRow paddingLeft={3} paddingRight={3} justifyContent="flex-end">
          <Stack size={1} horizontal>
            <IconButton
              label={formatMessage({
                id: getTrad('app.utils.delete'),
                defaultMessage: 'Delete',
              })}
              icon={<DeleteIcon />}
              onClick={() => setShowConfirmDialog(true)}
            />

            <IconButton
              label={formatMessage({
                id: getTrad('control-card.download'),
                defaultMessage: 'Download',
              })}
              icon={<DownloadIcon />}
              onClick={() => downloadFile(assetUrl, asset.name)}
            />

            <CopyLinkButton url={assetUrl} />

            <IconButton
              label={formatMessage({ id: getTrad('control-card.crop'), defaultMessage: 'Crop' })}
              icon={<Resize />}
              onClick={() => crop(previewRef.current)}
            />
          </Stack>
        </ActionRow>

        <Wrapper>
          {isLoading && (
            <UploadProgressWrapper>
              <UploadProgress error={error} onCancel={cancel} progress={progress} />
            </UploadProgressWrapper>
          )}

          <img
            aria-hidden={isLoading}
            ref={previewRef}
            src={prefixFileUrlWithBackendUrl(asset.url)}
            alt={asset.name}
          />
        </Wrapper>

        <ActionRow
          paddingLeft={2}
          paddingRight={2}
          justifyContent="flex-end"
          blurry={isInCroppingMode}
        >
          {isInCroppingMode && width && height && (
            <BadgeOverride background="neutral900" color="neutral0">
              {`${height}✕${width}`}
            </BadgeOverride>
          )}
        </ActionRow>
      </RelativeBox>

      {showConfirmDialog && (
        <RemoveAssetDialog
          onClose={() => {
            setShowConfirmDialog(false);
            onDelete();
          }}
          asset={asset}
        />
      )}
    </>
  );
};

PreviewBox.propTypes = {
  asset: PropTypes.shape({
    id: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
    size: PropTypes.number,
    createdAt: PropTypes.string,
    ext: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string,
    mime: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
