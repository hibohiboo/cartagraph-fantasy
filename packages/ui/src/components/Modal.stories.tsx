import { useState } from 'react';
import { Modal, Dialog } from './Modal';
import type { Meta } from '@storybook/react';

const meta = {
  title: 'Layout/Modal',
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;

const BasicModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        モーダルを開く
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="基本的なモーダル"
      >
        <p>これは基本的なモーダルダイアログです。</p>
        <p className="mt-2 text-gray-600">
          ESCキーまたは背景をクリックして閉じることができます。
        </p>
      </Modal>
    </>
  );
};

export const BasicModal = () => <BasicModalComponent />;

const WithFooterComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        フッター付きモーダル
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="確認が必要な操作"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                alert('実行されました');
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              実行
            </button>
          </div>
        }
      >
        <p>この操作を実行しますか？</p>
      </Modal>
    </>
  );
};

export const WithFooter = () => <WithFooterComponent />;

const SmallSizeComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        小サイズ
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="小さいモーダル"
        size="sm"
      >
        <p>これは小さいサイズのモーダルです。</p>
      </Modal>
    </>
  );
};

export const SmallSize = () => <SmallSizeComponent />;

const LargeSizeComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        大サイズ
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="大きいモーダル"
        size="lg"
      >
        <div className="space-y-4">
          <p>これは大きいサイズのモーダルです。</p>
          <p>より多くのコンテンツを表示できます。</p>
        </div>
      </Modal>
    </>
  );
};

export const LargeSize = () => <LargeSizeComponent />;

const LongContentComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        長いコンテンツ
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="スクロール可能なモーダル"
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i}>
              段落 {i + 1}: これは長いコンテンツのサンプルです。
              モーダル内でスクロールが可能になります。
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
};

export const LongContent = () => <LongContentComponent />;

const NoBackdropCloseComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        背景クリック無効
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="重要な確認"
        closeOnBackdrop={false}
        footer={
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            閉じる
          </button>
        }
      >
        <p>背景をクリックしても閉じません。ボタンまたはESCキーで閉じてください。</p>
      </Modal>
    </>
  );
};

export const NoBackdropClose = () => <NoBackdropCloseComponent />;

// Dialog component stories
const InfoDialogComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        情報ダイアログ
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="情報"
        message="これは情報ダイアログです。"
        variant="info"
      />
    </>
  );
};

export const InfoDialog = () => <InfoDialogComponent />;

const WarningDialogComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        警告ダイアログ
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="警告"
        message="この操作には注意が必要です。"
        variant="warning"
      />
    </>
  );
};

export const WarningDialog = () => <WarningDialogComponent />;

const DangerDialogComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        危険ダイアログ
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="削除の確認"
        message="このアイテムを削除してもよろしいですか？この操作は取り消せません。"
        variant="danger"
        confirmText="削除"
        onConfirm={() => alert('削除されました')}
      />
    </>
  );
};

export const DangerDialog = () => <DangerDialogComponent />;

const MultipleModalsComponent = () => {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setFirstOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        最初のモーダル
      </button>
      <Modal
        isOpen={firstOpen}
        onClose={() => setFirstOpen(false)}
        title="最初のモーダル"
      >
        <p>最初のモーダルです。</p>
        <button
          onClick={() => setSecondOpen(true)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          2つ目を開く
        </button>
      </Modal>
      <Modal
        isOpen={secondOpen}
        onClose={() => setSecondOpen(false)}
        title="2つ目のモーダル"
        size="sm"
      >
        <p>2つ目のモーダルです。</p>
      </Modal>
    </>
  );
};

export const MultipleModals = () => <MultipleModalsComponent />;
